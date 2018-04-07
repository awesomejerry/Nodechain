import hash from '../core/hash'

export const calculateHash = (index, previousHash, timestamp, data) => {
  return hash(index + previousHash + timestamp + data).toString()
}

export const calculateHashForNode = (node) => {
  return calculateHash(node.index, node.previousHash, node.timestamp, node.data)
}
