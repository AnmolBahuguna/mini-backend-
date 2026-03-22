import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useThreatCheck } from '../../../hooks/useThreatCheck'

const { post, get } = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
}))

vi.mock('../../../lib/api', () => ({
  api: {
    post,
    get,
  },
}))

describe('useThreatCheck', () => {
  beforeEach(() => {
    post.mockReset()
    get.mockReset()
  })

  it('has initial state', () => {
    const { result } = renderHook(() => useThreatCheck())
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets data on success', async () => {
    post.mockResolvedValue({ data: { drs_score: 5.2, risk_level: 'MEDIUM', api_results: {}, cached: false } })

    const { result } = renderHook(() => useThreatCheck())

    await act(async () => {
      await result.current.analyze('example.com', 'url')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.score).toBe(5.2)
  })

  it('sets error on failure', async () => {
    post.mockRejectedValue(new Error('Threat check failed'))

    const { result } = renderHook(() => useThreatCheck())

    await act(async () => {
      await expect(result.current.analyze('x', 'url')).rejects.toThrow('Threat check failed')
    })
    await waitFor(() => expect(result.current.error).toContain('Threat check failed'))
  })
})
