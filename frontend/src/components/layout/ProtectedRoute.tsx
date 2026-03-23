import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/AuthContext'
import { useSupabaseSession } from '../../hooks/useSupabaseSession'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const supabaseSession = useSupabaseSession()
  const location = useLocation()

  const busy = loading || supabaseSession.loading
  const isAuthed = Boolean(user) || Boolean(supabaseSession.session)

  if (busy) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-gray-300">Loading...</div>
  }

  if (!isAuthed) {
    const returnUrl = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/auth/login?returnUrl=${returnUrl}`} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
