import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './store/AuthContext'
import { AppRoutes } from './routes/AppRoutes'

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useAuth()
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <AuthBootstrap>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthBootstrap>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export default App
