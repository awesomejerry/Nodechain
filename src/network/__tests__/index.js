import Network from '../index'

const mockSocketIO = () => {
  return {
    ons: [],
    emits: [],
    on(type, callback) {
      this.ons.push(type)
      callback(JSON.stringify({ type }))
    },
    emit(type) {
      this.emits.push(type)
    }
  }
}

class mockRTCPeerConnection {
  createOffer() { return Promise.resolve('offer') }
  createAnswer() { return Promise.resolve('answer') }
  createDataChannel() {
    return {
      onopen() {},
      onclose() {}
    }
  }
  setLocalDescription = () => {
    this.localDescription = 'local'
  }
}

describe('network', () => {
  it('should setup a Socket.io connection', async () => {
    const network = new Network({
      signaling: 'test',
      socketIO: mockSocketIO,
      RTCPeerConnection: mockRTCPeerConnection
    })

    expect(network.socket).toBeNull()

    await network.connect()

    expect(network.socket).toBeDefined()
  })

  it('should connect to RTCPeerConnection', async () => {
    const peerId = 'foo'
    const network = new Network({
      signaling: 'test',
      socketIO: mockSocketIO,
      RTCPeerConnection: mockRTCPeerConnection
    })

    await network.connect()

    expect(network.socket.emits).toEqual(['join-channel', 'msg-channel'])
    expect(network.socket.ons).toEqual(['connected', 'msg-channel', 'msg-peer', 'joined-channel'])

    expect(network.connection[peerId]).toBeUndefined()

    await network.connectToRTC(peerId)

    expect(network.connection[peerId].localDescription).toBeDefined()
  })
})
