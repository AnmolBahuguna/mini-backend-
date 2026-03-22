import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { SignupPage } from '../../../pages/auth/SignupPage'

const signUp = vi.fn()
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

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('SignupPage', () => {
  beforeEach(() => {
    signUp.mockReset()
    useAuthMock.mockReturnValue({ user: null, signUp })
  })

  it('starts with account step fields', () => {
    render(<MemoryRouter><SignupPage /></MemoryRouter>)

    expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue →' })).toBeInTheDocument()
  })

  it('moves from account step to location step', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><SignupPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('Your full name'), 'A User')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com')
    await user.click(screen.getByRole('button', { name: 'Continue →' }))

    expect(await screen.findByPlaceholderText('+91XXXXXXXXXX')).toBeInTheDocument()
    expect(screen.getByText('This helps us send regional threat alerts.')).toBeInTheDocument()
  })

  it('shows password mismatch on security step', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><SignupPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('Your full name'), 'A User')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com')
    await user.click(screen.getByRole('button', { name: 'Continue →' }))

    await user.type(await screen.findByPlaceholderText('+91XXXXXXXXXX'), '+919876543210')
    await user.selectOptions(screen.getByRole('combobox'), 'Delhi')
    await user.click(screen.getByRole('button', { name: 'Continue →' }))

    await user.type(await screen.findByPlaceholderText('Password'), 'Password1')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Password2')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
  })

  it('shows password strength on security step', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><SignupPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('Your full name'), 'A User')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com')
    await user.click(screen.getByRole('button', { name: 'Continue →' }))
    await user.type(await screen.findByPlaceholderText('+91XXXXXXXXXX'), '+919876543210')
    await user.selectOptions(screen.getByRole('combobox'), 'Delhi')
    await user.click(screen.getByRole('button', { name: 'Continue →' }))

    const pwd = await screen.findByPlaceholderText('Password')
    await user.type(pwd, 'abc')
    expect(screen.getByText('Weak')).toBeInTheDocument()

    await user.clear(pwd)
    await user.type(pwd, 'Abc@123456789!')
    expect(screen.getByText('Very Strong')).toBeInTheDocument()
  })

  it('submits valid form and redirects', async () => {
    const user = userEvent.setup()
    signUp.mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={['/auth/signup']}>
        <Routes>
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/" element={<div>home-page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByPlaceholderText('Your full name'), 'Test User')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com')
    await user.click(screen.getByRole('button', { name: 'Continue →' }))

    await user.type(await screen.findByPlaceholderText('+91XXXXXXXXXX'), '+919876543210')
    await user.selectOptions(screen.getByRole('combobox'), 'Maharashtra')
    await user.click(screen.getByRole('button', { name: 'Continue →' }))

    await user.type(await screen.findByPlaceholderText('Password'), 'Password1')
    await user.type(screen.getByPlaceholderText('Confirm password'), 'Password1')
    await user.click(screen.getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => expect(signUp).toHaveBeenCalled())
    expect(screen.getByText('home-page')).toBeInTheDocument()
  })

  it('has sign in link', () => {
    render(<MemoryRouter><SignupPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/auth/login')
  })
})
