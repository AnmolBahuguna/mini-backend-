import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ForgotPasswordPage } from '../../../pages/ForgotPasswordPage'

describe('ForgotPasswordPage', () => {
  it('renders email input and send button', () => {
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
  })

  it('shows success state after submit', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('you@example.com'), 'user@test.com')
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }))

    expect(await screen.findByText('Check your inbox!')).toBeInTheDocument()
    expect(screen.getByText(/A reset link has been sent to user@test.com/)).toBeInTheDocument()
  })

  it('has back to sign in link', () => {
    render(<MemoryRouter><ForgotPasswordPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: '← Back to Sign In' })).toHaveAttribute('href', '/auth/login')
  })
})
