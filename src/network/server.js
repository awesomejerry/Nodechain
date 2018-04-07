import Signaling from '../signaling'

const server = new Signaling({ port: 8888 })

server.start()
