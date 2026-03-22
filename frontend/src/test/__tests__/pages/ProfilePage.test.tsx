import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ProfilePage } from '../../../pages/ProfilePage'

const useAuthMock = vi.fn()

vi.mock('../../../store/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({
      user: {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        joinedAt: '2026-01-01T00:00:00Z',
      },
    })
  })

  it('renders profile tabs', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>)

    expect(screen.getByRole('button', { name: 'My Reports' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Saved Alerts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Emergency Contacts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Account Settings' })).toBeInTheDocument()
  })

  it('switches to emergency contacts and adds contact', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ProfilePage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Emergency Contacts' }))

    await user.type(screen.getByPlaceholderText('Name'), 'Rohit')
    await user.type(screen.getByPlaceholderText('Phone'), '+919999999999')
    await user.type(screen.getByPlaceholderText('Relationship'), 'Friend')
    await user.click(screen.getByRole('button', { name: /Add Contact/i }))

    expect(screen.getByText('Rohit')).toBeInTheDocument()
  })

  it('switches to notifications and account settings', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ProfilePage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(screen.getByText('Email alerts')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Account Settings' }))
    expect(screen.getByRole('button', { name: 'Save Settings' })).toBeInTheDocument()
  })
})
