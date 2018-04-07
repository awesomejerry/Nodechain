import Nodechain from '../src/nodechain'

setTimeout(ready, 1000)

let nodechain = null

function ready() {
  bindEvents()

  nodechain = new Nodechain({
    signaling: 'http://192.168.50.12:8888',
    socketIO: io,
    RTCPeerConnection: window.RTCPeerConnection,
    RTCIceCandidate: window.RTCIceCandidate,
    RTCSessionDescription: window.RTCSessionDescription,
    RTCIceCandidate: window.RTCIceCandidate,
    keys: {}
  })
}

function bindEvents() {
  document.querySelector('#connect').addEventListener('click', () => {
    nodechain.connect('my room').then(() => {
      document.querySelector('#connect').innerHTML = 'Connected'
    })
    nodechain.on('node_added', updateNumber)
    nodechain.on('chain_replaced', updateNumber)
  })

  document.querySelector('#add').addEventListener('click', () => {
    nodechain.addNewNode({ random: Math.random() })
    updateNumber()
  })

  document.querySelector('#show').addEventListener('click', showBlocks)
}

function updateNumber() {
  document.querySelector('#number').textContent = nodechain.chain.length
}

function showBlocks() {
  const $ul = document.querySelector('#blocks')
  while ($ul.firstChild) {
    $ul.removeChild($ul.firstChild);
  }
  for (let index = 0; index < nodechain.chain.length; index++) {
    const node = nodechain.chain[index]
    const $li = document.createElement('li')
    $li.innerHTML = `${node.hash}: ${JSON.stringify(node.data)} at ${node.timestamp} tracking ${node.previousHash}`
    document.querySelector('#blocks').appendChild($li)
  }
}
