import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CommunityPage } from '../../../pages/CommunityPage'

describe('CommunityPage', () => {
  it('renders stats and threat cards', () => {
    render(<MemoryRouter><CommunityPage /></MemoryRouter>)

    expect(screen.getByText('Active Reports')).toBeInTheDocument()
    expect(screen.getByText('Community Intelligence Feed')).toBeInTheDocument()
    expect(screen.getByText('UPI Fraud — Fake KYC Update')).toBeInTheDocument()
  })

  it('renders sort options and report button', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CommunityPage /></MemoryRouter>)

    const filters = screen.getAllByRole('combobox')
    await user.selectOptions(filters[0], 'All Types')
    expect(filters[0]).toHaveValue('All Types')

    expect(screen.getByText(/Report a Threat/i).closest('a')).toHaveAttribute('href', '/community/report')
  })
})
