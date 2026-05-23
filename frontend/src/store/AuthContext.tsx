/* eslint-disable react-refresh/only-export-components */
import { useEffect, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from './authStore'
import { useAuth } from '../hooks/useAuth'

export const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)
  useEffect(() => {
    void initialize()
  }, [initialize])
  const value = useAuth()
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
