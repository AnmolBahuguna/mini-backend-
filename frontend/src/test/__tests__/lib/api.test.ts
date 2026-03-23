import type { InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { api } from '../../../lib/api'

describe('api lib', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('uses base URL and timeout', () => {
    expect(api.defaults.baseURL).toContain('http://localhost:8000')
    expect(api.defaults.timeout).toBe(30000)
  })

  it('keeps request config unchanged when no auth integration is configured', async () => {
    const requestHandlers = api.interceptors.request.handlers ?? []
    const handler = requestHandlers[0]?.fulfilled
    expect(handler).toBeTypeOf('function')
    if (!handler) {
      throw new Error('Request interceptor handler is missing')
    }

    const config = await handler({ headers: {} } as InternalAxiosRequestConfig)
    expect(config.headers.Authorization).toBeUndefined()
  })

  it('redirects on 401', async () => {
    const assign = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { assign },
      writable: true,
    })

    const responseHandlers = api.interceptors.response.handlers ?? []
    const rejectHandler = responseHandlers[0]?.rejected
    expect(rejectHandler).toBeTypeOf('function')
    if (!rejectHandler) {
      throw new Error('Response interceptor handler is missing')
    }

    await expect(rejectHandler({ response: { status: 401 } })).rejects.toBeTruthy()
    expect(assign).toHaveBeenCalledWith('/auth/login')
  })
})
