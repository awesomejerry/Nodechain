import { generate, encrypt, decrypt, sign, verify } from '../pki'
import hashFunction from '../hash'

describe('core/pki', () => {
  it('should generate public and private keys correctly', () => {
    const result = generate()
    expect(result).toHaveProperty('publicKey')
    expect(result).toHaveProperty('privateKey')
  })

  it('should encrypt message with public key and decrypt by private key', () => {
    const result = generate()

    const message = 'dump'
    
    const encrypted = encrypt({ message, key: result.publicKey })
    const decrypted = decrypt({ buffer: encrypted, key: result.privateKey })

    expect(message).toBe(decrypted.toString())
  })

  it('should sign message with private key and verify by public key', () => {
    const result = generate()
    const data = 'my data'

    const signed = sign({ message: data, key: result.privateKey })
    const verified = verify({ message: data, signature: signed, key: result.publicKey })

    expect(verified).toBeTruthy()
  })
})
