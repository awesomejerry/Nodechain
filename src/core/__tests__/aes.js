import { encrypt, decrypt } from '../aes'

describe('core/aes', () => {
  it('should encrypt payload into token', () => {
    const encrypted = encrypt({ foo: 'bar' }, 'secret')

    expect(typeof encrypted).toBe('string')
  })

  it('should decrypt token into payload', () => {
    const encrypted = encrypt({ foo: 'bar' }, 'secret')
    const decrypted = decrypt(encrypted, 'secret')

    expect(decrypted).toHaveProperty('foo')
  })
})
