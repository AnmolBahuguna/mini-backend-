import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from '../../../pages/HomePage'

// Keep count-up deterministic for tests
vi.mock('../../../components/ui/StatsCounter', () => ({
  StatsCounter: ({ value, suffix = '', label }: { value: number; suffix?: string; label?: string }) => (
    <div>
      <span>{value}{suffix}</span>
      {label ? <span>{label}</span> : null}
    </div>
  ),
}))

const renderWithClient = (ui: ReactNode) => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('HomePage', () => {
  it('renders hero headline and primary CTAs', () => {
    renderWithClient(<HomePage />)

    expect(screen.getByText("India's Predictive Cyber Intelligence Platform")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Analyze Threat' })).toHaveAttribute('href', '/threat-check')
    expect(screen.getByRole('link', { name: 'Women Safety Hub' })).toHaveAttribute('href', '/women-safety')
    expect(screen.getByRole('link', { name: 'Community Reports' })).toHaveAttribute('href', '/community')
  })

  it('shows live ticker and key sections', () => {
    renderWithClient(<HomePage />)

    expect(screen.getByLabelText('Live threat ticker')).toBeInTheDocument()
    expect(screen.getByText('Intelligence at Every Layer')).toBeInTheDocument()
    expect(screen.getByText('How DHIP Works')).toBeInTheDocument()
    expect(screen.getByText('10 Integrated APIs')).toBeInTheDocument()
  })

  it('renders stats and final CTA block', () => {
    renderWithClient(<HomePage />)

    expect(screen.getByText('Active Reports')).toBeInTheDocument()
    expect(screen.getByText('Detection Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Contributors')).toBeInTheDocument()
    expect(screen.getByText('Threats Prevented')).toBeInTheDocument()
    expect(screen.getByText('Join the Movement. Protect Your India.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start Checking Threats' })).toHaveAttribute('href', '/threat-check')
    expect(screen.getByRole('link', { name: 'Report Anonymously' })).toHaveAttribute('href', '/community/report')
  })
})
