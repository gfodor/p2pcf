import P2PCF from './p2pcf.js'

if (!document.location.hash) {
  document.location =
    document.location.toString() +
    `#room-example-${Math.floor(Math.random() * 100000)}`
}

const p2pcf = new P2PCF('testguy', document.location.hash.substring(1))
window.p2pcf = p2pcf

const removePeerUi = clientId => {
  document.getElementById(clientId)?.remove()
}

const addPeerUi = sessionId => {
  if (document.getElementById(sessionId)) return

  const peerEl = document.createElement('div')
  peerEl.style = 'display: flex;'

  const name = document.createElement('div')
  name.innerText = sessionId.substring(0, 5)

  peerEl.id = sessionId
  peerEl.appendChild(name)

  document.getElementById('peers').appendChild(peerEl)
}

const addMessage = message => {
  const messageEl = document.createElement('div')
  messageEl.innerText = message

  document.getElementById('messages').appendChild(messageEl)
}

p2pcf.on('peerconnect', peer => {
  console.log('Peer connect', peer.id, peer)
  addPeerUi(peer.id)
})

p2pcf.on('peerclose', peer => {
  console.log('Peer close', peer.id, peer)
  removePeerUi(peer.id)
})

p2pcf.on('msg', (peer, data) => {
  addMessage(
    peer.id.substring(0, 5) + ': ' + new TextDecoder('utf-8').decode(data)
  )
})

p2pcf.start()

export const waitForEvent = function (eventName, eventObj) {
  return new Promise(resolve => {
    eventObj.addEventListener(eventName, resolve, { once: true })
  })
}

const go = () => {
  document.getElementById('session-id').innerText =
    p2pcf.sessionId.substring(0, 5) + '@' + p2pcf.roomId + ':'

  document.getElementById('send-button').addEventListener('click', () => {
    const box = document.getElementById('send-box')
    addMessage(p2pcf.sessionId.substring(0, 5) + ': ' + box.value)
    p2pcf.broadcast(new TextEncoder().encode(box.value))
    box.value = ''
  })
}

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  go()
} else {
  window.addEventListener('DOMCOntentLoaded', go, { once: true })
}
