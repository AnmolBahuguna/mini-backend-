/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { UserProfile } from '../types/auth'
import { supabase } from '../lib/supabase'

const CURRENT_USER_KEY = 'dhip.auth.currentUser'
const USERS_KEY = 'dhip.auth.users'

type AuthContextValue = {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (payload: {
    fullName: string
    email: string
    password: string
    phone?: string
    state?: string
  }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

type StoredUser = UserProfile & { password: string }

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function sessionToProfile(session: Session | null): UserProfile | null {
  if (!session?.user) return null
  const meta = session.user.user_metadata as Record<string, string | undefined> | undefined
  const displayName = meta?.full_name || meta?.name || session.user.email || 'DHIP User'
  return {
    id: session.user.id,
    email: session.user.email || 'unknown@user',
    displayName,
    phone: meta?.phone,
    state: meta?.state,
    joinedAt: session.user.created_at,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub: (() => void) | undefined

    const hydrate = async () => {
      if (supabase) {
        const { data } = await supabase.auth.getSession()
        const supabaseProfile = sessionToProfile(data.session)
        if (supabaseProfile) {
          setUser(supabaseProfile)
          setLoading(false)
        } else {
          const raw = localStorage.getItem(CURRENT_USER_KEY)
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as UserProfile
              if (parsed?.email && parsed?.id) {
                setUser(parsed)
              }
            } catch {
              setUser(null)
            }
          }
          setLoading(false)
        }

        const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          const next = sessionToProfile(nextSession)
          setUser(next)
          if (!next) {
            localStorage.removeItem(CURRENT_USER_KEY)
          }
          setLoading(false)
        })

        unsub = () => listener.subscription.unsubscribe()
      } else {
        try {
          const raw = localStorage.getItem(CURRENT_USER_KEY)
          if (raw) {
            const parsed = JSON.parse(raw) as UserProfile
            if (parsed?.email && parsed?.id) {
              setUser(parsed)
            }
          }
        } catch {
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    }

    void hydrate()
    return () => { if (unsub) unsub() }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async (email, password) => {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message)
        setUser(sessionToProfile(data.session))
        return
      }

      const users = readUsers()
      const existing = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password)
      if (!existing) {
        throw new Error('Invalid credentials')
      }

      const profile: UserProfile = {
        id: existing.id,
        email: existing.email,
        displayName: existing.displayName,
        phone: existing.phone,
        state: existing.state,
        joinedAt: existing.joinedAt,
      }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile))
      setUser(profile)
    },
    signUp: async ({ fullName, email, password, phone, state }) => {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
              state,
            },
          },
        })
        if (error) throw new Error(error.message)
        setUser(sessionToProfile(data.session))
        return
      }

      const users = readUsers()
      const alreadyExists = users.some((item) => item.email.toLowerCase() === email.toLowerCase())
      if (alreadyExists) {
        throw new Error('User already exists with this email')
      }

      const userId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `user_${Date.now()}`
      const storedUser: StoredUser = {
        id: userId,
        email,
        displayName: fullName,
        phone,
        state,
        joinedAt: new Date().toISOString(),
        password,
      }
      users.push(storedUser)
      saveUsers(users)

      const profile: UserProfile = {
        id: storedUser.id,
        email: storedUser.email,
        displayName: storedUser.displayName,
        phone: storedUser.phone,
        state: storedUser.state,
        joinedAt: storedUser.joinedAt,
      }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile))
      setUser(profile)
    },
    signOut: async () => {
      localStorage.removeItem(CURRENT_USER_KEY)
      if (supabase) {
        await supabase.auth.signOut()
      }
      setUser(null)
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function useOptionalAuth() {
  return useContext(AuthContext)
}
