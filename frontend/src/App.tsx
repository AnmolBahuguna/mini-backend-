import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import { AppRoutes } from './routes/AppRoutes'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <AppRoutes />
          </AnimatePresence>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
