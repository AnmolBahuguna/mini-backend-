import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { EvidenceVaultPage } from '../../../pages/EvidenceVaultPage'

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  },
}))

describe('EvidenceVaultPage', () => {
  it('renders upload zone and encryption controls', () => {
    render(<MemoryRouter><EvidenceVaultPage /></MemoryRouter>)

    expect(screen.getByText('Evidence Vault')).toBeInTheDocument()
    expect(screen.getByText('Encryption Level')).toBeInTheDocument()
    expect(screen.getByText('AES-4096 Tactical')).toBeInTheDocument()
  })

  it('shows existing evidence list', () => {
    render(<MemoryRouter><EvidenceVaultPage /></MemoryRouter>)

    expect(screen.getByText('Signal_Intercept_99.enc')).toBeInTheDocument()
    expect(screen.getByText('Auth_Log_Fragment.txt')).toBeInTheDocument()
  })

  it('triggers upload action', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><EvidenceVaultPage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: /Upload New Evidence/i }))

    expect(screen.getByText(/Zero-Knowledge Guarantee/i)).toBeInTheDocument()
  })
})
