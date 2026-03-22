import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from '../../../pages/HomePage'

vi.mock('../../../components/home/HeroSection', () => ({
  HeroSection: () => <div>AI-Powered Cyber Intelligence</div>,
}))

vi.mock('../../../components/home/BentoGrid', () => ({
  BentoGrid: () => <div>Built as a Premium Intelligence Grid</div>,
}))

vi.mock('../../../components/home/HowItWorks', () => ({
  HowItWorks: () => <div>Threat Intelligence Scanner</div>,
}))

vi.mock('../../../components/home/StatsSection', () => ({
  StatsSection: () => <div>Threats Detected (12 months)</div>,
}))

vi.mock('../../../components/home/Testimonials', () => ({
  Testimonials: () => <div>Trusted voices</div>,
}))

vi.mock('../../../components/home/CTASection', () => ({
  CTASection: () => (
    <div>
      <div>Join 50,000+ Indians staying safe online</div>
      <a href="/auth/signup">Create Free Account</a>
      <a href="/features">See How It Works</a>
    </div>
  ),
}))

describe('HomePage', () => {
  it('renders redesigned hero and capability sections', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)

    expect(screen.getByText('AI-Powered Cyber Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Built as a Premium Intelligence Grid')).toBeInTheDocument()
    expect(screen.getByText('Threat Intelligence Scanner')).toBeInTheDocument()
  })

  it('renders stats and final CTA copy', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)

    expect(screen.getByText('Threats Detected (12 months)')).toBeInTheDocument()
    expect(screen.getByText('Join 50,000+ Indians staying safe online')).toBeInTheDocument()
  })

  it('has CTA links for signup and features', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)

    expect(screen.getByRole('link', { name: 'Create Free Account' })).toHaveAttribute('href', '/auth/signup')
    expect(screen.getByRole('link', { name: 'See How It Works' })).toHaveAttribute('href', '/features')
  })
})
