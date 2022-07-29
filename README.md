![image](https://user-images.githubusercontent.com/220020/181821538-4ace5e9d-1fa0-4146-881b-368bcb253f6c.png)


# P2PCF

P2PCF enables free (or cheap) serverless WebRTC signalling using a [Cloudflare worker](https://workers.cloudflare.com/) and a [Cloudflare R2](https://www.cloudflare.com/products/r2/) bucket. The API is inspired by [P2PT](https://github.com/subins2000/p2pt), but instead of using WebTorrent trackers, which may go down, a custom Cloudflare worker is provided whose I/O is designed to be free for most use-cases, and otherwise very cheap.

The point of this is so people can deploy WebRTC-enabled applications without having to think (much) about managing a signaling server. Out of the box the library will "just work" using a public worker that is subject to quota. [Setting up your own worker](https://github.com/gfodor/p2pcf/blob/master/INSTALL.md) is easy and just requires a few minutes using Cloudflare.

P2PCF also has some additional features:

- Room-based keying for easy connection management + acquisition
- Minimal initial signalling (1 or 2 signalling messages) using the technique [put together](https://twitter.com/evan_brass/status/1549078627282722816) by [@evan_brass](https://twitter.com/evan_brass/status)
- Subsequent signalling over DataChannels
- Efficient chunking + delivery of DataChannel messages that exceed the ~16k limit
- Peers handed back from the API are [simple-peer](https://github.com/feross/simple-peer) instances which provides a simple API for interacting with the underlying PeerConnections (adding + removing media tracks, etc)

# Example + Usage

P2PCF will use a free public worker to get you started but you should [set up your own worker on Cloudflare](https://github.com/gfodor/p2pcf/blob/master/INSTALL.md).

A basic chat + video sharing example demonstrates the library at https://gfodor.github.io/p2pcf-demo ([source](https://github.com/gfodor/p2pcf/blob/master/examples/basic-video-chat/index.js))

Basic usage:

```
import P2PCF from 'p2pcf'

const username = 'MyUsername'
const room = 'MyRoom'

const p2pcf = new P2PCF(username, room, {
  // Worker URL (optional) - if left out, will use a public worker
  workerUrl: '<your worker url>'
  
  // STUN ICE servers (optional)
  // If left out, will use public STUN from Google + Twilio
  stunIceServers: <your STUN servers>,
  
  // TURN ICE servers (optional)
  // If left out, will use openrelay public TURN servers from metered.ca
  turnIceServers: <your TURN servers>,
  
  // Network change poll interval (milliseconds, optional, default: 15000, 15 seconds)
  // Interval to poll STUN for network changes + reconnect
  networkChangePollIntervalMs: ...,
  
  // State expiration interval (milliseconds, optional, default: 120000, 2 minutes)
  // Timeout interval for peers during polling
  stateExpirationIntervalMs: ...,
  
  // State heartbeat interval (milliseconds, optional, default: 30000, 30 seconds)
  // Time before expiration to heartbeat
  stateHeartbeatWindowMs: ...,
  
  // Fast polling rate (milliseconds, optional, default: 750)
  // Polling rate during state transitions
  fastPollingRateMs: ...,
  
  // Slow polling rate (milliseconds, optional, default: 5000, 5 seconds)
  // Polling rate when state is idle
  slowPollingRateMs: ...,
});

// Start polling
p2pcf.start()

p2pcf.on('peerconnect', peer => {
  // New peer connected
  // Peer is an instance of simple-peer (https://github.com/feross/simple-peer)
})

p2pcf.on('peerclose', peer => {
  // Peer has disconnected
})

p2pcf.on('msg', (peer, data) => {
  // Received data from peer (data is an ArrayBuffer)
})

// Broadcast a message via data channel to all peers
p2pcf.broadcast(new ArrayBuffer(...))

// To send a message via data channel to just one peer:
p2pcf.send(peer, new ArrayBuffer(...))

// To stop polling + shut down (not necessary to call this typically, page transition suffices.)
p2pcf.destroy()
```

`stunIceServers` and `turnIceServers` are optional, but if provided, should be in the format of the [`iceServers` option](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection#parameters) passed to `RTCPeerConnection`.

Note that peers who are both on symmetric NATs (or one symmetric NAT + one port restricted NAT) will use TURN. If you do not specify a TURN server then the TURN server provided by [Open Relay](https://www.metered.ca/tools/openrelay/) will be used. It's estimated 8% of visitors require TURN.

# Estimated Cloudflare Usage

The worker provides signalling via HTTP polling (with backoff when the room is idle), and each request to the server performs a small number of reads from R2. Each join will do at least 1 writes to R2 and up to N + 1 writes (one for each peer, and a metadata update) in the worst-case where all peers are behind symmetric NATs and need to perform bi-directional hole punching to establish their initial DataChannel. Subsequent renegoations are performed over the DataChannel and so do not incur any R2 writes. Clients also heartbeat to maintain livliness every 90 seconds, which incurs an additional write each time.

R2's [free tier](https://developers.cloudflare.com/r2/platform/pricing/) offers 1M writes per month and 10M reads per month. Cloudflare workers offer ~30M [free requests](https://developers.cloudflare.com/workers/platform/pricing/) per month. In general, these free tiers should support any modest WebRTC application's signalling needs without forcing developers to rely upon public signalling servers.
