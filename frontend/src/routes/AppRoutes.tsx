import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'
import { NavBar } from '../components/layout/NavBar'
import { PageTransition } from '../components/layout/PageTransition'
import { CustomCursor } from '../components/ui/CustomCursor'
import { useAuth } from '../store/AuthContext'
import { useSupabaseSession } from '../hooks/useSupabaseSession'
import { AdultSafetyPage } from '../pages/AdultSafetyPage'
import { AlertsPage } from '../pages/AlertsPage'
import { FeaturesPage } from '../pages/FeaturesPage'
import { CommunityPage } from '../pages/CommunityPage'
import { EvidenceVaultPage } from '../pages/EvidenceVaultPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { AboutPage } from '../pages/AboutPage'
import { ProfilePage } from '../pages/ProfilePage'
import { ReportDetailPage } from '../pages/ReportDetailPage'
import { ReportPage } from '../pages/ReportPage'
import { SignupPage } from '../pages/SignupPage'
import { ThreatCheckPage } from '../pages/ThreatCheckPage'
import { WomenSafetyPage } from '../pages/WomenSafetyPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const supabaseSession = useSupabaseSession()

  if (auth.loading || supabaseSession.loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-gray-300">Loading...</div>
  }

  const hasAppUser = Boolean(auth.user)
  const hasSupabaseUser = supabaseSession.enabled ? Boolean(supabaseSession.session?.user) : false

  if (!hasAppUser && !hasSupabaseUser) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}

export function AppRoutes() {
  const location = useLocation()

  return (
    <>
      <CustomCursor />
      <NavBar />
      <main className="min-h-[calc(100vh-64px)] pt-16">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/threat-check" element={<PageTransition><ThreatCheckPage /></PageTransition>} />
            <Route path="/alerts" element={<PageTransition><AlertsPage /></PageTransition>} />
            <Route path="/women-safety" element={<PageTransition><WomenSafetyPage /></PageTransition>} />
            <Route path="/adult-safety" element={<PageTransition><AdultSafetyPage /></PageTransition>} />
            <Route path="/evidence" element={<ProtectedRoute><PageTransition><EvidenceVaultPage /></PageTransition></ProtectedRoute>} />
            <Route path="/community" element={<PageTransition><CommunityPage /></PageTransition>} />
            <Route path="/features" element={<PageTransition><FeaturesPage /></PageTransition>} />
            <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
            <Route path="/community/report" element={<PageTransition><ReportPage /></PageTransition>} />
            <Route path="/reports/:id" element={<PageTransition><ReportDetailPage /></PageTransition>} />
            <Route path="/auth/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/auth/signup" element={<PageTransition><SignupPage /></PageTransition>} />
            <Route path="/auth/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
            <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  )
}
