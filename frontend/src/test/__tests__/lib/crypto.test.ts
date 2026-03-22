import { describe, expect, it, vi, beforeEach } from 'vitest'
import { decryptFile, encryptFile, generateFileHash } from '../../../lib/crypto'

const deriveKey = vi.fn()
const encrypt = vi.fn()
const decrypt = vi.fn()
const digest = vi.fn()
const importKey = vi.fn()

describe('crypto lib', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      subtle: {
        importKey,
        deriveKey,
        encrypt,
        decrypt,
        digest,
      },
      getRandomValues: (arr: Uint8Array) => {
        arr.fill(1)
        return arr
      },
    } as unknown as Crypto)

    importKey.mockResolvedValue({})
    deriveKey.mockResolvedValue({})
    encrypt.mockResolvedValue(new Uint8Array([9, 8, 7]).buffer)
    decrypt.mockResolvedValue(new Uint8Array([1, 2, 3]).buffer)
    digest.mockResolvedValue(new Uint8Array([1, 2, 3, 4]).buffer)
  })

  it('encryptFile returns encrypted buffer', async () => {
    const input = new Uint8Array([1, 2, 3]).buffer
    const result = await encryptFile(input, 'password')

    expect(Array.from(new Uint8Array(result.encrypted))).not.toEqual(Array.from(new Uint8Array(input)))
    expect(encrypt).toHaveBeenCalled()
  })

  it('decryptFile returns original bytes for correct password', async () => {
    const out = await decryptFile(new Uint8Array([9]).buffer, 'password', new Uint8Array(12), new Uint8Array(16))
    expect(new Uint8Array(out)).toEqual(new Uint8Array([1, 2, 3]))
  })

  it('decryptFile throws on wrong password', async () => {
    decrypt.mockRejectedValueOnce(new Error('OperationError'))
    await expect(
      decryptFile(new Uint8Array([9]).buffer, 'wrong', new Uint8Array(12), new Uint8Array(16)),
    ).rejects.toThrow('OperationError')
  })

  it('generateFileHash is deterministic', async () => {
    const input = new Uint8Array([1, 2, 3]).buffer
    const hash1 = await generateFileHash(input)
    const hash2 = await generateFileHash(input)
    expect(hash1).toBe(hash2)
  })

  it('generateFileHash differs for different input', async () => {
    digest
      .mockResolvedValueOnce(new Uint8Array([1, 2, 3, 4]).buffer)
      .mockResolvedValueOnce(new Uint8Array([1, 2, 3, 5]).buffer)

    const hash1 = await generateFileHash(new Uint8Array([1]).buffer)
    const hash2 = await generateFileHash(new Uint8Array([2]).buffer)
    expect(hash1).not.toBe(hash2)
  })
})
