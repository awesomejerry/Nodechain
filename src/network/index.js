// import { encrypt, decrypt } from '../core/pki'
import { encrypt, decrypt } from '../core/aes'

const DEFAULT_PROPS = {}
const SIGNALING = 'http://localhost:8888'
const KEYS = { publicKey: 'foo', privateKey: 'bar' }

const RTC_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
}

class Network {
  connection = {}
  signaling = null
  socketIO = null
  RTCPeerConnection = null
  RTCSessionDescription = null
  RTCIceCandidate = null
  socket = null
  keys = null
  constructor(props = DEFAULT_PROPS) {
    const {
      signaling = SIGNALING,
      socketIO,
      RTCPeerConnection,
      RTCSessionDescription,
      RTCIceCandidate,
      keys = KEYS,
      onBroadcast
    } = props

    this.signaling = signaling
    this.socketIO = socketIO
    this.RTCPeerConnection = RTCPeerConnection
    this.RTCSessionDescription = RTCSessionDescription
    this.RTCIceCandidate = RTCIceCandidate
    this.keys = keys
    this.onBroadcast = onBroadcast
  }
  connect = channel => {
    this.disconnect()
    this.socket = this.socketIO(this.signaling)
    return new Promise((resolve, reject) => {
      this.socket.on('connected', () => {
        console.log('connected to socket.io')
        this.connectToChannel(channel).then(resolve)
      })
    })
  }
  connectToChannel = name => {
    this.socket.emit('join-channel', name)
    return new Promise((resolve, reject) => {
      this.socket.on('msg-channel', this.handleChannelMessage)
      this.socket.on('msg-peer', this.handlePeerMessage)
      this.socket.on('joined-channel', () => {
        console.log('joined channel', name)
        this.sendMsgToChannel('online', this.socket.id)
        resolve(true)
      })
    })
  }
  setupRTCPeerConnection = socketId => {
    const connection = new this.RTCPeerConnection(RTC_CONFIG)

    connection.onicecandidate = event =>
      this.handleIceCandidate(event, socketId)

    this.connection[socketId] = connection
    return connection
  }
  connectToRTC = socketId => {
    const connection = this.setupRTCPeerConnection(socketId)
    connection.socketId = socketId
    this.handleCreateDataChannel(connection)
    return connection
      .createOffer()
      .then(offer => connection.setLocalDescription(offer))
      .then(() => {
        console.log('give offer to', socketId)
        return this.sendMsgToPeer(
          'offer',
          {
            offer: connection.localDescription,
            publicKey: this.keys.publicKey
          },
          socketId
        )
      })
      .catch(e => console.log(e))
  }
  sendMsgToChannel = (type, socketId) => {
    this.socket.emit('msg-channel', this.constructMessage(type, socketId))
  }
  sendMsgToPeer = (type, payload, peer) => {
    this.socket.emit('msg-peer', this.constructMessage(type, payload, peer))
  }
  handleChannelMessage = msg => {
    const data = JSON.parse(msg)
    if (data.type === 'online') {
      this.connectToRTC(data.payload)
    }
  }
  handlePeerMessage = msg => {
    const data = JSON.parse(msg)
    if (data.type === 'offer') {
      console.log('got offer from', data.from)
      const { offer, publicKey } = data.payload
      const connection = this.setupRTCPeerConnection(data.from)
      connection.socketId = data.from
      connection.publicKey = publicKey
      connection.ondatachannel = event =>
        this.handleOnDataChannel(event, connection)
      const description = this.getDescription(offer)
      connection
        .setRemoteDescription(description)
        .then(() => connection.createAnswer())
        .then(answer => connection.setLocalDescription(answer))
        .then(() => {
          console.log('give answer to', data.from)
          this.sendMsgToPeer(
            'answer',
            {
              answer: connection.localDescription,
              publicKey: this.keys.publicKey
            },
            data.from
          )
        })
        .catch(e => console.log(e))
    } else if (data.type === 'answer') {
      console.log('got answer from', data.from)
      const { answer, publicKey } = data.payload
      const connection = this.connection[data.from]
      connection.publicKey = publicKey
      const description = this.getDescription(answer)
      connection.setRemoteDescription(description).catch(e => console.log(e))
    } else if (data.type === 'candidate') {
      console.log('got candidate from', data.from)
      const connection = this.connection[data.from]
      connection.addIceCandidate(new this.RTCIceCandidate(data.payload))
    }
  }
  broadcast = (type, payload) => {
    Object.values(this.connection).forEach(connection => {
      const { publicKey, socketId } = connection
      const message = encrypt({ type, payload }, socketId)
      // const arrayBuffer = encrypt({ message, key: publicKey })
      // connection.dataChannel.send(arrayBuffer)
      connection.dataChannel.send(message)
    })
  }
  handleIceCandidate = (event, socketId) => {
    if (event.candidate) {
      console.log('give candidate to', socketId)
      this.sendMsgToPeer('candidate', event.candidate, socketId)
    }
  }
  handleCreateDataChannel = connection => {
    const dataChannel = connection.createDataChannel('secretChannel')
    dataChannel.onmessage = this.handleReceiveMessage
    dataChannel.onopen = event =>
      this.handleSendChannelStatusChange(event, connection)
    dataChannel.onclose = event =>
      this.handleSendChannelStatusChange(event, connection)
    connection.dataChannel = dataChannel
  }
  handleOnDataChannel = (event, connection) => {
    const dataChannel = event.channel
    dataChannel.onmessage = this.handleReceiveMessage
    dataChannel.onopen = event =>
      this.handleReceiveChannelStatusChange(event, connection)
    dataChannel.onclose = event =>
      this.handleReceiveChannelStatusChange(event, connection)
    connection.dataChannel = dataChannel
  }
  handleReceiveMessage = event => {
    // const data = decrypt({ buffer: event.data, key: this.keys.privateKey }).toString()
    // console.log(decode(data, this.socket.id))
    const data = decrypt(event.data, this.socket.id)
    if (this.onBroadcast) {
      this.onBroadcast(data)
    }
  }
  handleSendChannelStatusChange = (event, connection) => {
    console.log('sendChannel', connection.dataChannel.readyState)
  }
  handleReceiveChannelStatusChange = (event, connection) => {
    console.log('receiveChannel', connection.dataChannel.readyState)
    if (connection.dataChannel.readyState === 'closed') {
      let targetKey = null
      for (let key in this.connection) {
        if (this.connection[key] === connection) {
          targetKey = key
          break
        }
      }
      delete this.connection[targetKey]
    }
  }
  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
  constructMessage = (type, payload, peer) => {
    return JSON.stringify({ type, payload, peer })
  }
  getDescription = data => {
    return this.RTCSessionDescription
      ? new this.RTCSessionDescription(data)
      : data
  }
}

export default Network
