// const test = require('tape')
//
// let P2PT
// if (process.env.BROWSER_TEST) {
//   P2PT = require('../p2pt')
// } else {
//   P2PT = require('../node')
// }
//
// const announceURLs = [
//   'ws://localhost:5000'
//   // 'wss://tracker.btorrent.xyz:443/'
// ]
//
// const randomString = (length) => {
//   return [...Array(length)]
//     .map(() => (~~(Math.random() * 36)).toString(36))
//     .join('')
// }
//
// test('large message', function (t) {
//   var p2pt1 = new P2PT(announceURLs, 'p2pt')
//   var p2pt2 = new P2PT(announceURLs, 'p2pt')
//
//   const KB100 = randomString(100000) // 100KB
//   const KB1000 = randomString(1000000) // 1MB
//
//   p2pt1.on('peerconnect', (peer) => {
//     p2pt1.send(peer, KB100).then(([peer, msg]) => {
//       t.equal(msg, KB1000)
//
//       p2pt1.destroy()
//       p2pt2.destroy()
//       t.end()
//     })
//   })
//
//   p2pt2.on('msg', (peer, msg) => {
//     t.equal(msg, KB100)
//     peer.respond(KB1000)
//   })
//
//   p2pt1.start()
//   p2pt2.start()
// })
//
// test('json', function (t) {
//   var p2pt1 = new P2PT(announceURLs, 'p2pt')
//   var p2pt2 = new P2PT(announceURLs, 'p2pt')
//
//   const KB100 = {
//     hello: randomString(100000) // 100KB
//   }
//   const KB1000 = {
//     hello: randomString(1000000) // 1MB
//   }
//
//   p2pt1.on('peerconnect', (peer) => {
//     p2pt1.send(peer, KB100).then(([peer, msg]) => {
//       t.equal(msg.hello, KB1000.hello)
//
//       p2pt1.destroy()
//       p2pt2.destroy()
//       t.end()
//     })
//   })
//
//   p2pt2.on('msg', (peer, msg) => {
//     t.equal(msg.hello, KB100.hello)
//     peer.respond(KB1000)
//   })
//
//   p2pt1.start()
//   p2pt2.start()
// })
