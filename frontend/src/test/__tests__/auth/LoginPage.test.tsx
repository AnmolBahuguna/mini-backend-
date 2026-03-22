import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LoginPage } from '../../../pages/auth/LoginPage'

const signIn = vi.fn()
const useAuthMock = vi.fn()

vi.mock('../../../store/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    signIn.mockReset()
    useAuthMock.mockReturnValue({ user: null, signIn })
  })

  it('renders email/password fields and Sign In button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('validates invalid email and short password', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><LoginPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'invalid-email')
    await user.type(screen.getByPlaceholderText('Password'), '123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => expect(signIn).not.toHaveBeenCalled())
  })

  it('calls signIn and redirects on success', async () => {
    const user = userEvent.setup()
    signIn.mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/" element={<div>home-page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com')
    await user.type(screen.getByPlaceholderText('Password'), 'Password1')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => expect(signIn).toHaveBeenCalledWith('user@test.com', 'Password1'))
    expect(await screen.findByText('home-page')).toBeInTheDocument()
  })

  it('shows loading text while submitting', async () => {
    const user = userEvent.setup()
    signIn.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<MemoryRouter><LoginPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com')
    await user.type(screen.getByPlaceholderText('Password'), 'Password1')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled()
  })

  it('navigates via forgot and signup links', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/auth/forgot-password')
    const signupLinks = screen.getAllByRole('link', { name: 'Create free account' })
    expect(signupLinks.length).toBeGreaterThan(0)
    signupLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/auth/signup')
    })
  })

  it('redirects already authenticated user', () => {
    useAuthMock.mockReturnValue({ user: { id: '1' }, signIn })

    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/" element={<div>home-page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('home-page')).toBeInTheDocument()
  })
})
