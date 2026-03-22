import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ReportPage } from '../../../pages/ReportPage'

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('ReportPage', () => {
  it('renders required fields', () => {
    render(<MemoryRouter><ReportPage /></MemoryRouter>)

    expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter suspicious URL / phone / UPI')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe what happened')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ReportPage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Submit Report' }))

    expect(await screen.findByText('Threat type is required')).toBeInTheDocument()
    expect(await screen.findByText('Threat entity is required')).toBeInTheDocument()
  })

  it('submits valid report', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><ReportPage /></MemoryRouter>)

    await user.selectOptions(screen.getAllByRole('combobox')[0], 'URL/Link')
    await user.type(screen.getByPlaceholderText('Enter suspicious URL / phone / UPI'), 'example.com')
    await user.type(screen.getByPlaceholderText('Describe what happened'), 'x'.repeat(60))
    await user.selectOptions(screen.getAllByRole('combobox')[1], 'Delhi')

    await user.click(screen.getByRole('button', { name: 'Submit Report' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled())
  })
})
