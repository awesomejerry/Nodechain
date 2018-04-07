import Network from '../network'
import hash from '../core/hash'
import Node from './node'
import { calculateHash, calculateHashForNode } from './utils'

const GenesisNode = new Node({
  index: 0,
  previousHash: '0',
  timestamp: 0,
  data: {},
  hash: calculateHash(0, '0', 0, {})
})

export default class Nodechain {
  keys = null
  network = null
  isConnected = false
  chain = [GenesisNode]
  events = {}
  constructor(props) {
    this.network = new Network({
      ...props,
      onBroadcast: this.onBroadcast
    })
  }
  connect = channel => {
    return this.network.connect(channel)
  }
  isValidNode = (node, prevNode) => {
    if (node.index !== prevNode.index + 1) {
      return false
    } else if (node.previousHash !== prevNode.hash) {
      return false
    } else if (calculateHashForNode(node) !== node.hash) {
      return false
    }
    return true
  }
  addNewNode = data => this.addNodeAndBroadcast(this.generateNextNode(data))
  addNode = node => {
    if (!this.isValidNode(node, this.getLatestNode())) {
      console.log('addNode failed, request the chain to replace')
      this.network.broadcast(
        'requestChain',
        this.chain.map(node => node.toJSON())
      )
      return false
    }
    this.chain.push(node)
  }
  addNodeAndBroadcast = node => {
    this.addNode(node)
    this.network.broadcast('addNode', this.getLatestNode().toJSON())
  }
  generateNextNode = data => {
    const latestNode = this.getLatestNode()
    const index = latestNode.index + 1
    const previousHash = latestNode.hash
    const timestamp = Date.now()
    return new Node({
      index,
      previousHash,
      timestamp,
      data,
      hash: calculateHash(index, previousHash, timestamp, data)
    })
  }
  onBroadcast = data => {
    const { type, payload } = data

    if (type === 'addNode') {
      const node = new Node(payload)
      this.addNode(node)
      this.emit('node_added', node)

    } else if (type === 'requestChain') {
      this.network.broadcast(
        'replaceChain',
        this.chain.map(node => node.toJSON())
      )

    } else if (type === 'replaceChain') {
      if (this.chain.length < payload.length) {
        const chain = payload.map(n => new Node(n))
        this.chain = chain
        this.emit('chain_replaced', chain)
      } else {
        this.network.broadcast(
          'replaceChain',
          this.chain.map(node => node.toJSON())
        )
      }
    }
  }
  on = (event, callback) => {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)

    return () => {
      const index = this.events[event].indexOf(callback)
      if (index > -1) {
          this.events[event].splice(index, 1);
      }
    }
  }
  emit = (event, payload) => {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(payload))
    }
  }
  getLatestNode = () => this.chain[this.chain.length - 1]
  disconnect = () => {
    if (this.network) {
      this.network.disconnect()
    }
  }
}
