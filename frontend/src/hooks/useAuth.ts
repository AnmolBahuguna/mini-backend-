import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, session, isLoading, error, login, signup, logout, initialize } = useAuthStore((state) => ({
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    error: state.error,
    login: state.login,
    signup: state.signup,
    logout: state.logout,
    initialize: state.initialize,
  }))

  const isAuthenticated = useMemo(() => !!session?.access_token, [session])

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    initialize,
  }
}
