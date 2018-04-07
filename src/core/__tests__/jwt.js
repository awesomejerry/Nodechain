import { sign, verify } from '../jwt'

describe('core/jwt', () => {
  it('should sign payload into token', () => {
    const signed = sign({ foo: 'bar' }, 'secret')

    expect(typeof signed).toBe('string')
  })

  it('should verify token into payload', () => {
    const signed = sign({ foo: 'bar' }, 'secret')
    const verified = verify(signed, 'secret')

    expect(verified).toHaveProperty('foo')
    expect(verified).toHaveProperty('iat')
  })
})
