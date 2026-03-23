import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NavBar } from '../../../components/layout/NavBar'

const signOut = vi.fn()
const useAuthMock = vi.fn()

vi.mock('../../../store/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}))

describe('NavBar', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ user: null, signOut })
    signOut.mockReset()
  })

  it('renders logo and primary links', () => {
    render(<MemoryRouter><NavBar /></MemoryRouter>)
    expect(screen.getByText('DHIP')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Threat Check' })).toBeInTheDocument()
  })

  it('shows sign in and get started when logged out', () => {
    render(<MemoryRouter><NavBar /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/auth/login')
  })

  it('shows avatar and sign out when logged in', async () => {
    const user = userEvent.setup()
    useAuthMock.mockReturnValue({ user: { displayName: 'Test User' }, signOut })

    render(<MemoryRouter><NavBar /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Sign Out' }))
    expect(signOut).toHaveBeenCalled()
  })

  it('toggles mobile drawer', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><NavBar /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    expect(screen.getAllByText('Threat Check').length).toBeGreaterThan(0)
  })
})
