import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { AlertsPage } from '../../../pages/AlertsPage'

const renderWithClient = (ui: ReactNode) => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AlertsPage', () => {
  it('renders heading, alert cards, and side widgets', () => {
    renderWithClient(<AlertsPage />)

    expect(screen.getByText(/Live Threat Alerts/i)).toBeInTheDocument()
    expect(screen.getByText(/Filters/i)).toBeInTheDocument()
    expect(screen.getByText('Regional Risk Meter')).toBeInTheDocument()
  })

  it('changes threat type filter value', async () => {
    const user = userEvent.setup()
    renderWithClient(<AlertsPage />)

    const selects = screen.getAllByRole('combobox')
    await user.selectOptions(selects[1], 'UPI Fraud')

    expect(selects[1]).toHaveValue('UPI Fraud')
  })

  it('shows emergency numbers block', () => {
    renderWithClient(<AlertsPage />)
    expect(screen.getByText(/Cyber Helpline/i)).toBeInTheDocument()
    expect(screen.getByText('1930')).toBeInTheDocument()
  })
})
