import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CircularMeter } from '../../../components/ui/CircularMeter'

describe('CircularMeter', () => {
  it('renders svg meter', () => {
    const { container } = render(<CircularMeter value={50} label="Risk" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders value 0, 50 and 100 states', () => {
    const { rerender } = render(<CircularMeter value={0} label="Risk" />)
    expect(screen.getByText('0')).toBeInTheDocument()

    rerender(<CircularMeter value={50} label="Risk" />)
    expect(screen.getByText('50')).toBeInTheDocument()

    rerender(<CircularMeter value={100} label="Risk" />)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('shows label text', () => {
    render(<CircularMeter value={20} label="Delhi Risk Score" />)
    expect(screen.getByText('Delhi Risk Score')).toBeInTheDocument()
  })
})
