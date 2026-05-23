import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

const envBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim()
const normalizedBaseUrl = envBaseUrl
  ? (/\/api\/?$/i.test(envBaseUrl) ? envBaseUrl.replace(/\/+$/, '') : `${envBaseUrl.replace(/\/+$/, '')}/api`)
  : 'http://127.0.0.1:8000/api'

export const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// REQUEST: attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const baseURL = String(config.baseURL || '')
  const hasApiSuffix = /\/api\/?$/i.test(baseURL)
  if (hasApiSuffix && typeof config.url === 'string' && config.url.startsWith('/api/')) {
    // Allow callers to use either "/x" or "/api/x" when baseURL already ends with /api.
    config.url = config.url.replace(/^\/api/, '')
  }

  const url = String(config.url || '')
  const isPublicEndpoint =
    url.includes('/crime-stats/') ||
    url.includes('/live-alerts/') ||
    url.includes('/dashboard-combined/') ||
    url.includes('/news/') ||
    url.includes('/threat-check/') ||
    url.includes('/scan/') ||
    url.includes('/support-chat/') ||
    url.includes('/chatbot/')

  if (isPublicEndpoint && config.headers?.Authorization) {
    delete config.headers.Authorization
  }

  const token = useAuthStore.getState().token || useAuthStore.getState().session?.access_token
  if (token && !isPublicEndpoint) {
    config.headers.Authorization = `Bearer ${token}` 
  }
  return config
})

// RESPONSE: handle auth errors and server errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const failedUrl = String(error?.config?.url || '')
    const isSupportChat = failedUrl.includes('/support-chat/') || failedUrl.includes('/chatbot/')
    if (error.response?.status === 401 && !isSupportChat) {
      const currentSession = useAuthStore.getState().session
      if (supabase && currentSession?.refresh_token) {
        const { data, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: currentSession.refresh_token,
        })
        if (!refreshError && data.session?.access_token) {
          localStorage.setItem('dhip_token', data.session.access_token)
          useAuthStore.setState({
            session: data.session,
            token: data.session.access_token,
            isAuthenticated: true,
          })
          error.config.headers.Authorization = `Bearer ${data.session.access_token}`
          return apiClient.request(error.config)
        }
      }
      localStorage.removeItem('dhip_token')
      useAuthStore.setState({ user: null, session: null, token: null, isAuthenticated: false })
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient

