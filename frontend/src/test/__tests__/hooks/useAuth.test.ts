import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import React from 'react'
import { AuthProvider, useAuth } from '../../../store/AuthContext'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns loading then unauthenticated state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(AuthProvider, null, children)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
  })

  it('loads user from local storage session', async () => {
    localStorage.setItem('dhip.auth.currentUser', JSON.stringify({
      id: 'u1',
      email: 'user@test.com',
      displayName: 'Test User',
      state: 'Delhi',
      joinedAt: '2026-01-01T00:00:00Z',
    }))

    const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(AuthProvider, null, children)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.user?.email).toBe('user@test.com'))
  })

  it('signs out and clears session user', async () => {
    localStorage.setItem('dhip.auth.currentUser', JSON.stringify({
      id: 'u1',
      email: 'user@test.com',
      displayName: 'Test User',
    }))
    const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(AuthProvider, null, children)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.user?.email).toBe('user@test.com'))
    await act(async () => {
      await result.current.signOut()
    })

    await waitFor(() => expect(result.current.user).toBeNull())
    expect(localStorage.getItem('dhip.auth.currentUser')).toBeNull()
  })
})
