export default class Node {
  constructor({ index, previousHash, timestamp, data, hash }) {
    this.index = index
    this.previousHash = previousHash.toString()
    this.timestamp = timestamp
    this.data = data
    this.hash = hash.toString()
  }
  toJSON() {
    return {
      index: this.index,
      previousHash: this.previousHash,
      timestamp: this.timestamp,
      data: this.data,
      hash: this.hash
    }
  }
}
