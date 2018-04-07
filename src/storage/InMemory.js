export default class InMemory {
  _storage = {}
  save(key, data) {
    this._storage[key] = data
    return Promise.resolve(data)
  }
  load(key) {
    return Promise.resolve(this._storage[key])
  }
}
