import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { WomenSafetyPage } from '../../../pages/WomenSafetyPage'

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  },
}))

describe('WomenSafetyPage', () => {
  it('renders default tab and helplines', () => {
    render(<MemoryRouter><WomenSafetyPage /></MemoryRouter>)

    expect(screen.getByText('Layer 1: Private Help')).toBeInTheDocument()
    expect(screen.getByText('7827-170-170')).toBeInTheDocument()
    expect(screen.getByText('1930')).toBeInTheDocument()
    expect(screen.getByText('Private Help')).toBeInTheDocument()
  })

  it('shows panic button', () => {
    render(<MemoryRouter><WomenSafetyPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: '🆘 PANIC' })).toBeInTheDocument()
  })

  it('switches to chatbot tab', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><WomenSafetyPage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Layer 2: Support Network' }))
    expect(screen.getByText('Connect to trusted NGOs, helplines, and community groups at your own pace.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Community Feed' })).toHaveAttribute('href', '/community')
  })

  it('switches to safety planner tab', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><WomenSafetyPage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Layer 3: Legal Action' }))
    expect(screen.getByText('Legal Action')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Evidence Vault' })).toHaveAttribute('href', '/evidence')
  })
})
