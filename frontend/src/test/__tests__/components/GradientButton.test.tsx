import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GradientButton } from '../../../components/ui/GradientButton'

describe('GradientButton', () => {
  it('renders primary variant', () => {
    render(<GradientButton>Click</GradientButton>)
    const button = screen.getByRole('button', { name: 'Click' })
    expect(button).toHaveClass('shimmer')
    expect(button.className).toContain('from-[#0066FF]')
  })

  it('renders danger variant', () => {
    render(<GradientButton variant="danger">Delete</GradientButton>)
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('from-[#FF0044]')
  })

  it('renders outline variant', () => {
    render(<GradientButton variant="outline">Outline</GradientButton>)
    const button = screen.getByRole('button', { name: 'Outline' })
    expect(button.className).toContain('bg-white/5')
  })

  it('shows spinner and disables when loading', () => {
    render(<GradientButton loading>Saving</GradientButton>)
    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toBeDisabled()
    expect(button.querySelector('span')).toBeInTheDocument()
  })

  it('fires click when enabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<GradientButton onClick={onClick}>Go</GradientButton>)
    await user.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<GradientButton disabled onClick={onClick}>Go</GradientButton>)
    await user.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})
