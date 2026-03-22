import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { UserProfile } from '../types/auth'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async (email, password) => {
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
