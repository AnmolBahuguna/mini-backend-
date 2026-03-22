import axios from 'axios'
import { getSupabaseAccessToken } from './supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
})

api.interceptors.request.use(async (config) => {
  try {
    const token = await getSupabaseAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // no-op fallback for local/mock environments
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      window.location.assign('/auth/login')
    }
    return Promise.reject(error)
  },
)
