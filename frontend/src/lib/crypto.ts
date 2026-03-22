const encoder = new TextEncoder()

function toArrayBufferView(value: Uint8Array): Uint8Array<ArrayBuffer> {
  return new Uint8Array(value)
}

async function deriveKey(password: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBufferView(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptFile(input: ArrayBuffer, password: string) {
  const iv = toArrayBufferView(crypto.getRandomValues(new Uint8Array(12)))
  const salt = toArrayBufferView(crypto.getRandomValues(new Uint8Array(16)))
  const key = await deriveKey(password, salt)
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, input)

  return {
    encrypted: cipher,
    iv,
    salt,
  }
}

export async function decryptFile(encrypted: ArrayBuffer, password: string, iv: Uint8Array, salt: Uint8Array) {
  const key = await deriveKey(password, salt)
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: toArrayBufferView(iv) }, key, encrypted)
}

export async function generateFileHash(input: ArrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
