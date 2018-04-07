import io from 'socket.io-client'
import Signaling, { constants as c } from '../index'

const ioOptions = {
  transports: ['websocket'],
  forceNew: true,
  reconnection: false
}

describe('signaling', () => {
  it('should create a signaling server', () => {
    const server = new Signaling()

    expect(server).toBeDefined()
  })

  describe('signaling/connection', () => {
    const port = 8765
    const uri = `http://localhost:${port}`
    let server = null
    let peer = null

    beforeAll(done => {
      server = new Signaling({ port })
      server.start()
      peer = io(uri, ioOptions)
      done()
    })

    afterAll(done => {
      peer.disconnect()
      server.stop()
      done()
    })

    it('should accept client connection', done => {
      peer.on(c.CONNECTED, connectionId => {
        expect(server.connectedSockets).toHaveProperty(connectionId)
        expect(typeof connectionId).toBe('string')
        done()
      })
    })
    it('should ping pong', done => {
      const msg = 'hello'
      peer.emit(c.PING, msg)
      peer.on(c.PONG, m => {
        expect(m).toBe(msg)
        done()
      })
    })
  })

  describe('signaling/connection', () => {
    const port = 8766
    const uri = `http://localhost:${port}`
    let server = null
    let peer1 = null
    let peer2 = null

    beforeAll(done => {
      server = new Signaling({ port })
      server.start()
      peer1 = io(uri, ioOptions)
      peer2 = io(uri, ioOptions)
      done()
    })

    afterAll(done => {
      peer1.disconnect()
      peer2.disconnect()
      server.stop()
      done()
    })

    it('should ship messages between clients within the same channel', done => {
      const channel = 'my room'
      const msg = 'hello'
      const msg2 = 'world'
      peer1.emit(c.JOIN, channel)
      peer2.emit(c.JOIN, channel)
      peer2.on(c.JOINED, () => {
        expect(server.channels).toHaveProperty(channel)
        expect(server.channels[channel]).toHaveLength(2)
        peer2.emit(c.MSG_CHANNEL, msg)
      })
      peer1.on(c.MSG_CHANNEL, m => {
        expect(m).toBe(msg)
        peer1.emit(c.MSG_CHANNEL, msg2)
      })
      peer2.on(c.MSG_CHANNEL, m => {
        expect(m).toBe(msg2)
        done()
      })
    })
  })
})
