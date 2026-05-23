import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import './index.css'
import App from './App.tsx'
import { initializeSecurity } from './utils/environment'

// Initialize security measures
const securityInit = initializeSecurity()
if (!securityInit.secure) {
  console.warn('⚠️ Security initialization incomplete. Some features may not work properly.')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
      // Add error boundary for queries
      throwOnError: false,
    },
    mutations: {
      retry: 1,
      throwOnError: false,
    },
  },
})

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement)

type LeafletDefaultIcon = typeof L.Icon.Default.prototype & { _getIconUrl?: () => string }
const defaultIcon = L.Icon.Default.prototype as LeafletDefaultIcon

delete defaultIcon._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

// Error boundary for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    if (import.meta.env.PROD) {
      // In production, you might want to send this to an error reporting service
      event.preventDefault()
    }
  })
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
