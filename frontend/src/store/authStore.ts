/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { apiClient } from '../api/axiosInstance'

type AuthState = {
  user: User | null
  session: Session | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, extra?: { phone?: string; district?: string; state?: string }) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

let authSubscription: { unsubscribe: () => void } | null = null
const getStoredToken = () => (typeof window !== 'undefined' ? localStorage.getItem('dhip_token') : null)

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      token: getStoredToken(),
      isLoading: true,
      isAuthenticated: !!getStoredToken(),
      error: null,

      initialize: async () => {
        set({ isLoading: true, error: null })
        
        // If we have a persisted session from our backend fallback, trust it locally
        const state = get()
        const storedToken = getStoredToken()
        if (storedToken) {
          set({ token: storedToken, isAuthenticated: true, isLoading: false })
        }
        if (state.session?.access_token) {
          localStorage.setItem('dhip_token', state.session.access_token)
          set({ token: state.session.access_token, isAuthenticated: true, isLoading: false })
          return
        }
        if (state.session?.access_token?.startsWith('mock_token_')) {
          set({ isLoading: false })
          return
        }

        if (!supabase) {
          set({ isLoading: false })
          return
        }

        try {
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error

          const token = data.session?.access_token ?? null
          if (token) localStorage.setItem('dhip_token', token)
          set({ session: data.session, user: data.session?.user ?? null, token, isAuthenticated: !!token })

          if (!authSubscription) {
            const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
              const token = session?.access_token ?? null
              if (token) localStorage.setItem('dhip_token', token)
              else localStorage.removeItem('dhip_token')
              set({ session, user: session?.user ?? null, token, isAuthenticated: !!token })
            })
            authSubscription = listener.subscription
          }
        } catch (_err: unknown) {
          // Ignore initialization connection errors gracefully
        } finally {
          set({ isLoading: false })
        }
      },

      login: async (email, password) => {
        set({ error: null, isLoading: true })
        try {
          if (supabase) {
            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
              })
              if (!error && data.session) {
                localStorage.setItem('dhip_token', data.session.access_token)
                set({ session: data.session, user: data.session.user, token: data.session.access_token, isAuthenticated: true })
                return
              }
            } catch (_err: unknown) {
              // Fallback to backend API flow below.
            }
          }

          // Fallback to Django API (which has mock implementation if needed)
          const res = await apiClient.post('/auth/login/', {
            email: email.trim().toLowerCase(), 
            password
          })
          const data = res.data
          if (!res.status.toString().startsWith('2')) throw new Error(data.error || 'Login failed')
          const normalizedSession = data.session ?? (data.access_token ? {
            access_token: data.access_token,
            refresh_token: data.refresh_token ?? '',
            expires_at: data.expires_at ?? 0,
          } : null)
          const token = normalizedSession?.access_token ?? null
          if (token) {
            localStorage.setItem('dhip_token', token)
          }
          set({ session: normalizedSession, user: data.user, token, isAuthenticated: !!token })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Login failed'
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      signup: async (email, password, name, extra) => {
        set({ error: null, isLoading: true })
        try {
          if (supabase) {
            try {
              const { data, error } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
                options: { data: { full_name: name.trim() } },
              })
              if (!error && (data.session || data.user)) {
                const session = data.session ?? (await supabase.auth.getSession()).data.session
                const token = session?.access_token ?? null
                if (token) localStorage.setItem('dhip_token', token)
                set({ session, user: session?.user ?? null, token, isAuthenticated: !!token })
                return
              }
            } catch (_err: unknown) {
              // Fallback to backend API flow below.
            }
          }

          // Fallback to Django API
          const res = await apiClient.post('/auth/signup/', {
            email, 
            password, 
            full_name: name,
            phone: extra?.phone ?? '',
            district: extra?.district ?? '',
            state: extra?.state ?? ''
          })
          const data = res.data
          if (!res.status.toString().startsWith('2')) throw new Error(data.error || 'Signup failed')
          const normalizedSession = data.session ?? (data.access_token ? {
            access_token: data.access_token,
            refresh_token: data.refresh_token ?? '',
            expires_at: data.expires_at ?? 0,
          } : null)
          const token = normalizedSession?.access_token ?? null
          if (token) {
            localStorage.setItem('dhip_token', token)
          }
          set({ session: normalizedSession, user: data.user, token, isAuthenticated: !!token })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Signup failed'
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        set({ error: null, isLoading: true })
        try {
          if (supabase) {
            try {
              await supabase.auth.signOut()
            } catch (_err: unknown) {
              // Ignore remote signout failure; local cleanup still applies.
            }
          }
          // Reset local state regardless
          localStorage.removeItem('dhip_token')
          set({ user: null, session: null, token: null, isAuthenticated: false })
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Logout failed'
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },

      resetPassword: async (email: string) => {
        set({ error: null, isLoading: true })
        try {
          const res = await apiClient.post('/auth/password-reset/', { email })
          const data = res.data
          if (!res.status.toString().startsWith('2')) throw new Error(data.error || 'Password reset failed')
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Password reset failed'
          set({ error: message })
          throw new Error(message)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'dhip-auth',
      partialize: (state) => ({ 
        session: state.session,
        token: state.token,
      }),
    }
  )
)
