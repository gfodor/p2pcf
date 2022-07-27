const test = require('tape')

let P2PCF

if (process.env.BROWSER_TEST) {
  P2PCF = require('../p2pcf')
} else {
  P2PCF = require('../node')
}

const p2pcfOptions = {
  workerUrl: 'https://signaling-test.minddrop.workers.dev'
}

test('get network settings', async function (t) {
  const p2pcf1 = new P2PCF('p2pcf', 'room', p2pcfOptions)
  const [
    udpEnabled,
    isSymmetric,
    reflexiveIps,
    dtlsFingerprint
  ] = await p2pcf1._getNetworkSettings()
  t.true(udpEnabled)
  t.ok(typeof udpEnabled === 'boolean')
  t.ok(typeof isSymmetric === 'boolean')
  t.ok(reflexiveIps.size > 0)
  t.equal(dtlsFingerprint.length, 95)
  t.end()
})

test('basic', async function (t) {
  const p2pcf1 = new P2PCF('p2pcf1', 'room', p2pcfOptions)
  const p2pcf2 = new P2PCF('p2pcf2', 'room', p2pcfOptions)
  p2pcf1.on('peerconnect', peer => {
    p2pcf1.send(peer, 'hello')
  })
  p2pcf2.on('msg', (peer, msg) => {
    t.equal(msg, 'hello')
    p2pcf1.destroy()
    p2pcf2.destroy()
    t.end()
  })
  p2pcf1.start()
  p2pcf2.start()
})

// test('character message', function (t) {
//   var p2pcf1 = new p2pcf(announceURLs, 'p2pcf')
//   var p2pcf2 = new p2pcf(announceURLs, 'p2pcf')
//
//   p2pcf1.on('peerconnect', (peer) => {
//     p2pcf1.send(peer, 'hello')
//   })
//
//   p2pcf2.on('msg', (peer, msg) => {
//     t.equal(msg, 'hello')
//
//     p2pcf1.destroy()
//     p2pcf2.destroy()
//     t.end()
//   })
//
//   p2pcf1.start()
//   p2pcf2.start()
// })
//
// test('chained messages', function (t) {
//   var p2pcf1 = new p2pcf(announceURLs, 'p2pcf')
//   var p2pcf2 = new p2pcf(announceURLs, 'p2pcf')
//
//   p2pcf1.on('peerconnect', (peer) => {
//     p2pcf1
//       .send(peer, 'hello')
//       .then(([peer, msg]) => {
//         t.equal(msg, 'hi')
//         return peer.respond('how are you ?')
//       })
//       .then(([peer, msg]) => {
//         t.equal(msg, 'fine')
//         return peer.respond('byeee')
//       })
//       .then(([peer, msg]) => {
//         t.equal(msg, 'bye!')
//
//         p2pcf1.destroy()
//         p2pcf2.destroy()
//
//         t.end()
//       })
//   })
//
//   p2pcf2.on('msg', (peer, msg) => {
//     if (msg === 'hello') {
//       t.equal(msg, 'hello')
//       peer
//         .respond('hi')
//         .then(([peer, msg]) => {
//           t.equal(msg, 'how are you ?')
//           return peer.respond('fine')
//         })
//         .then(([peer, msg]) => {
//           t.equal(msg, 'byeee')
//           return peer.respond('bye!')
//         })
//     }
//   })
//
//   p2pcf1.start()
//   p2pcf2.start()
// })
//
// test('tracker connections', function (t) {
//   var p2pcf1 = new p2pcf(announceURLs, 'p2pcf')
//   var p2pcf2 = new p2pcf(['ws://127.0.0.1:404'], 'p2pcf')
//
//   p2pcf1.on('trackerconnect', (tracker, status) => {
//     t.equal(tracker.announceUrl, announceURLs[0])
//
//     t.equal(status.connected, 1)
//     t.equal(status.total, 1)
//
//     p2pcf1.destroy()
//     p2pcf2.start()
//   })
//
//   p2pcf2.on('trackerwarning', (error, status) => {
//     t.match(error.message, new RegExp(/error(.*?)ws:\/\/127\.0\.0\.1:404/gi))
//
//     t.equal(status.connected, 0)
//     t.equal(status.total, 1)
//
//     p2pcf2.destroy()
//
//     t.end()
//   })
//
//   p2pcf1.start()
// })
//
// test('tracker addition', function (t) {
//   const p2pcf1 = new p2pcf(announceURLs, 'p2pcf')
//   const p2pcf2 = new p2pcf(announceURLs1, 'p2pcf')
//
//   p2pcf1.on('peerconnect', (peer) => {
//     t.pass('Connect event emitted')
//
//     p2pcf1.destroy()
//     p2pcf2.destroy()
//     t.end()
//   })
//
//   p2pcf1.start()
//   p2pcf2.start()
//
//   // let 1st p2pcf1 know of tracker p2pcf2 is using
//   p2pcf1.addTracker(announceURLs1[0])
// })
//
// test('tracker removal', function (t) {
//   const p2pcf1 = new p2pcf(announceURLs, 'p2pcf')
//   const p2pcf2 = new p2pcf(announceURLs, 'p2pcf')
//
//   p2pcf1.on('msg', (peer, msg) => {
//     if (msg === 'hello') {
//       t.pass('Connection remained after tracker removal')
//
//       p2pcf1.destroy()
//       p2pcf2.destroy()
//       t.end()
//     }
//   })
//
//   p2pcf2.on('peerconnect', peer => {
//     p2pcf2.removeTracker(announceURLs[0])
//
//     setTimeout(() => {
//       p2pcf2.send(peer, 'hello')
//     }, 1000)
//   })
//
//   p2pcf1.start()
//   p2pcf2.start()
// })
//
// test('peer connections', function (t) {
//   const announce = announceURLs.concat(announceURLs1)
//
//   var p2pcf1 = new p2pcf(announce, 'p2pcf')
//   var p2pcf2 = new p2pcf(announce, 'p2pcf')
//
//   p2pcf1.on('peerconnect', (peer) => {
//     t.pass('Connect event emitted')
//
//     p2pcf1.send(peer, 'hello')
//   })
//
//   p2pcf1.on('peerclose', (peer) => {
//     t.pass('Close event emitted')
//   })
//
//   p2pcf1.on('msg', (peer, msg) => {
//     // Different trackers will give same peer with same ID, but different data channels
//     // this test will check if the second data channel is used if first is closed
//     p2pcf1.send(peer, 'hello3')
//   })
//
//   p2pcf2.on('peerconnect', (peer) => {
//     t.pass('Connect event emitted')
//   })
//
//   let msgReceiveCount = 0
//
//   p2pcf2.on('msg', (peer, msg) => {
//     // t.pass('Connect event emitted')
//
//     if (msgReceiveCount === 0) {
//       setTimeout(() => {
//         p2pcf2.send(peer, 'hello2')
//
//         // Forcefully close connection
//         peer.destroy()
//       }, 100)
//     } else {
//       t.equal(msg, 'hello3')
//
//       p2pcf1.destroy()
//       p2pcf2.destroy()
//
//       t.end()
//     }
//
//     msgReceiveCount++
//   })
//
//   p2pcf2.on('peerclose', (peer) => {
//     t.pass('Close event emitted')
//   })
//
//   p2pcf1.start()
//   p2pcf2.start()
// })
