import Node from '../node'

describe('node', () => {
  it('should create an instance of Node', () => {
    const node = new Node({
      index: 0,
      previousHash: 'phash',
      timestamp: Date.now(),
      data: { foo: 'bar' },
      hash: 'hash'
    })

    expect(node).toHaveProperty('index')
    expect(node).toHaveProperty('previousHash')
    expect(node).toHaveProperty('timestamp')
    expect(node).toHaveProperty(['data', 'foo'])
    expect(node).toHaveProperty('hash')
  })
})
