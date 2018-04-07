import hash from '../hash'

describe('core/hash', () => {
  it('should hash things correctly', () => {
    const input = 'apple'
    const output = hash(input)

    const sameInput = 'apple'
    const sameOutput = hash(sameInput)

    expect(output).toBe(sameOutput)
  })
})
