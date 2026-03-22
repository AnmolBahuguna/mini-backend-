import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ThreatCheckPage } from '../../../pages/ThreatCheckPage'

describe('ThreatCheckPage', () => {
  it('renders scanner heading, input, and action', () => {
    render(<MemoryRouter><ThreatCheckPage /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Threat Intelligence Scanner' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. suspicious-site.com, +91-9999999999, upi@example')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Analyze Risk' })).toBeInTheDocument()
  })

  it('renders all entity type chips', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ThreatCheckPage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'phone' }))
    expect(screen.getByRole('button', { name: 'url' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'email' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'upi' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'message' })).toBeInTheDocument()
  })

  it('fills input with an example chip', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ThreatCheckPage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'pay-sbi-secure.xyz' }))
    expect(screen.getByDisplayValue('pay-sbi-secure.xyz')).toBeInTheDocument()
  })

  it('shows result panel after running analysis', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ThreatCheckPage /></MemoryRouter>)

    await user.type(screen.getByPlaceholderText('e.g. suspicious-site.com, +91-9999999999, upi@example'), 'example.com')
    await user.click(screen.getByRole('button', { name: 'Analyze Risk' }))

    await waitFor(() => {
      expect(screen.getByText('HIGH RISK · VERIFIED')).toBeInTheDocument()
    }, { timeout: 3000 })
    expect(screen.getByText('Detection Breakdown')).toBeInTheDocument()
  })
})
