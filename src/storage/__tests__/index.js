import Storage from '../index'

describe('store', () => {

  it('should save data in memory by default', async () => {
    const storage = new Storage()

    const result = await storage.save('foo', 'bar')

    expect(result).toEqual('bar')
    expect(storage._instance).toBeDefined()
    expect(storage._instance._storage).toBeDefined()
  })

  it('should load data in memory by default', async () => {
    const storage = new Storage()

    storage.save('foo', 'bar')

    const data = await storage.load('foo')

    expect(data).toBe('bar')
  })

  it('should throw error if instance doesn\'t implement save/load method', () => {
    const storage = new Storage({ instance: {} })

    expect(() => storage.save('will', 'throw')).toThrow()
    expect(() => storage.load('will', 'throw')).toThrow()
  })
})
