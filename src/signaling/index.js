import { Server } from 'http'
import express from 'express'
import socket from 'socket.io'

import c from './constants'

const DEFAULT_PROPS = {}
const DEFAULT_PORT = 8888

export { c as constants }

export default class Signaling {
  http = null
  io = null
  port = null
  connectedSockets = {}
  channels = {}
  constructor({ port = DEFAULT_PORT } = DEFAULT_PROPS) {
    const app = express()
    this.port = port
    this.http = Server(app)
    this.io = socket(this.http)
  }
  start() {
    this.io.on(c.CONNECTION, socket => {
      socket.on(c.PING, (msg) => {
        socket.emit(c.PONG, msg)
      })
      socket.on(c.JOIN, (name) => {
        if (!this.channels[name]) {
          this.channels[name] = []
        }
        this.channels[name].push(socket)
        socket.join(name)
        socket.emit(c.JOINED, socket.id)
      })
      socket.on(c.LEAVE, (name) => {
        const index = this.channels[name].findIndex(s => s.id === socket.id)
        this.channels[name].splice(index, 1)
        socket.leave(name)
        socket.emit(c.LEFT, socket.id)
      })
      socket.on(c.MSG_CHANNEL, msg => {
        const keys = Object.keys(socket.rooms)
        Object.keys(socket.rooms)
          .filter(channel => channel !== socket.id)
          .forEach(channel => {
            socket.to(channel).emit(c.MSG_CHANNEL, msg)
          })
      })
      socket.on(c.MSG_PEER, msg => {
        const data = JSON.parse(msg)
        data.from = socket.id
        socket.to(data.peer).emit(c.MSG_PEER, JSON.stringify(data))
      })
      socket.on(c.DISCONNECT, () => {
        delete this.connectedSockets[socket.id]
        console.log('connection numbers:', Object.keys(this.connectedSockets).length)
      })
      this.connectedSockets[socket.id] = socket
      console.log('connection numbers:', Object.keys(this.connectedSockets).length)
      socket.emit(c.CONNECTED, socket.id)
    })
    this.http.listen(this.port, () => {
      console.log(`listening on *:${this.port}`)
    })
  }
  stop() {
    this.http.exit()
  }
}
