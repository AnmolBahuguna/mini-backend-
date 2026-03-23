import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)

const originalConsoleWarn = console.warn

console.warn = (...args: unknown[]) => {
  const [firstArg] = args
  if (typeof firstArg === 'string' && firstArg.includes('THREE.WARNING: Multiple instances of Three.js being imported.')) {
    return
  }
  originalConsoleWarn(...args)
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => {
  server.close()
  console.warn = originalConsoleWarn
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))

  class MockIntersectionObserver {
    constructor() {}
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: number[] = []
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn()
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})
