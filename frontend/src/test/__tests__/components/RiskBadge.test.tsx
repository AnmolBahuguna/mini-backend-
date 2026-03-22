import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RiskBadge } from '../../../components/ui/RiskBadge'

describe('RiskBadge', () => {
  it('renders HIGH with red class', () => {
    render(<RiskBadge level="HIGH" />)
    const badge = screen.getByText('HIGH')
    expect(badge).toHaveClass('bg-red-600')
  })

  it('renders MEDIUM with amber class', () => {
    render(<RiskBadge level="MEDIUM" />)
    expect(screen.getByText('MEDIUM')).toHaveClass('bg-amber-600')
  })

  it('renders LOW with gray class', () => {
    render(<RiskBadge level="LOW" />)
    expect(screen.getByText('LOW')).toHaveClass('bg-gray-600')
  })

  it('renders VERIFIED text', () => {
    render(<RiskBadge level="VERIFIED" />)
    expect(screen.getByText('VERIFIED')).toBeInTheDocument()
  })
})
