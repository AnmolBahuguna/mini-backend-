import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'
import { NavBar } from '../components/layout/NavBar'
import { PageTransition } from '../components/layout/PageTransition'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { CustomCursor } from '../components/ui/CustomCursor'

const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })))
const ThreatCheckPage = lazy(() => import('../pages/ThreatCheckPage').then((m) => ({ default: m.ThreatCheckPage })))
const AlertsPage = lazy(() => import('../pages/AlertsPage').then((m) => ({ default: m.AlertsPage })))
const WomenSafetyPage = lazy(() => import('../pages/WomenSafetyPage').then((m) => ({ default: m.WomenSafetyPage })))
const AdultSafetyPage = lazy(() => import('../pages/AdultSafetyPage').then((m) => ({ default: m.AdultSafetyPage })))
const EvidenceVaultPage = lazy(() => import('../pages/EvidenceVaultPage').then((m) => ({ default: m.EvidenceVaultPage })))
const CommunityPage = lazy(() => import('../pages/CommunityPage').then((m) => ({ default: m.CommunityPage })))
const FeaturesPage = lazy(() => import('../pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })))
const AboutPage = lazy(() => import('../pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ReportPage = lazy(() => import('../pages/ReportPage').then((m) => ({ default: m.ReportPage })))
const ReportDetailPage = lazy(() => import('../pages/ReportDetailPage').then((m) => ({ default: m.ReportDetailPage })))
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('../pages/SignupPage').then((m) => ({ default: m.SignupPage })))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const NotFoundPage = lazy(() => import('../pages/NotFound.tsx').then((m) => ({ default: m.NotFound })))

function ScrollToTop() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])
  return null
}

export function AppRoutes() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <CustomCursor />
      <NavBar />
      <main className="min-h-[calc(100vh-64px)] pt-16">
        <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-10 text-gray-300">Loading…</div>}>
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
              <Route
                path="/community/report"
                element={(
                  <ProtectedRoute>
                    <PageTransition><ReportPage /></PageTransition>
                  </ProtectedRoute>
                )}
              />
              <Route path="/reports/:id" element={<PageTransition><ReportDetailPage /></PageTransition>} />
              <Route path="/auth/login" element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/auth/signup" element={<PageTransition><SignupPage /></PageTransition>} />
              <Route path="/auth/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
              <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
              <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
