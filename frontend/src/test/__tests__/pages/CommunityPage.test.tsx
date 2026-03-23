import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { CommunityPage } from '../../../pages/CommunityPage'

const renderWithClient = (ui: ReactNode) => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CommunityPage', () => {
  it('renders stats and threat cards', () => {
    renderWithClient(<CommunityPage />)

    expect(screen.getByText('Active Reports')).toBeInTheDocument()
    expect(screen.getByText('Community Intelligence Feed')).toBeInTheDocument()
    expect(screen.getByText('UPI Fraud — Fake KYC Update')).toBeInTheDocument()
  })

  it('renders sort options and report button', async () => {
    const user = userEvent.setup()
    renderWithClient(<CommunityPage />)

    const filters = screen.getAllByRole('combobox')
    await user.selectOptions(filters[0], 'All Types')
    expect(filters[0]).toHaveValue('All Types')

    expect(screen.getByText(/Report a Threat/i).closest('a')).toHaveAttribute('href', '/community/report')
  })
})
