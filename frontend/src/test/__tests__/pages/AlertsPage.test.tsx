import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AlertsPage } from '../../../pages/AlertsPage'

describe('AlertsPage', () => {
  it('renders heading, alert cards, and side widgets', () => {
    render(<MemoryRouter><AlertsPage /></MemoryRouter>)

    expect(screen.getByText(/Live Threat Alerts/i)).toBeInTheDocument()
    expect(screen.getByText('SBI Phishing Wave — State-Wide')).toBeInTheDocument()
    expect(screen.getByText('Regional Risk Meter')).toBeInTheDocument()
  })

  it('changes threat type filter value', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><AlertsPage /></MemoryRouter>)

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[1], 'UPI Fraud')

    expect(selects[1]).toHaveValue('UPI Fraud')
  })

  it('shows emergency numbers block', () => {
    render(<MemoryRouter><AlertsPage /></MemoryRouter>)
    expect(screen.getByText(/Emergency Numbers/i)).toBeInTheDocument()
    expect(screen.getByText('1930')).toBeInTheDocument()
  })
})
