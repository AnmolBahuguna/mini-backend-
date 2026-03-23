import { AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './store/AuthContext'
import { AppRoutes } from './routes/AppRoutes'

function AuthBootstrap({ children }: { children: ReactNode }) {
  useAuth()
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <AuthBootstrap>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <AppRoutes />
          </AnimatePresence>
        </BrowserRouter>
      </AuthBootstrap>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export default App
