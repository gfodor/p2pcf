/**
 * Peer 2 Peer WebRTC connections with Cloudflare Workers as signalling server
 * Copyright Greg Fodor <gfodor@gmail.com>
 * Licensed under MIT
 */

const getBrowserRTC = require('get-browser-rtc')
const EventEmitter = require('events')
const debug = require('debug')('p2pcf')

const MAX_MESSAGE_LENGTH_BYTES = 16000

const CHUNK_HEADER_LENGTH_BYTES = 12 // 2 magic, 2 msg id, 2 chunk id, 2 for done bit, 4 for length
const CHUNK_MAGIC_WORD = 8121
const CHUNK_MAX_LENGTH_BYTES =
  MAX_MESSAGE_LENGTH_BYTES - CHUNK_HEADER_LENGTH_BYTES

const CANDIDATE_TYPES = {
  host: 0,
  srflx: 1,
  relay: 2
}

const CANDIDATE_TCP_TYPES = {
  active: 0,
  passive: 1,
  so: 2
}

const CANDIDATE_IDX = {
  TYPE: 0,
  PROTOCOL: 1,
  IP: 2,
  PORT: 3,
  RELATED_IP: 4,
  RELATED_PORT: 5,
  TCP_TYPE: 6
}

const DEFAULT_STUN_ICE = [
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' }
]

const DEFAULT_TURN_ICE = [
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
]

const ua = (global.window && global.window.navigator.userAgent) || ''
const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
const webkit = !!ua.match(/WebKit/i)
const iOSSafari = iOS && webkit && !ua.match(/CriOS/i)

// parseCandidate from https://github.com/fippo/sdp
const parseCandidate = line => {
  let parts

  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ')
  } else {
    parts = line.substring(10).split(' ')
  }

  const candidate = [
    CANDIDATE_TYPES[parts[7]], // type
    parts[2].toLowerCase() === 'udp' ? 0 : 1, // protocol
    parts[4], // ip
    parseInt(parts[5], 10) // port
  ]

  for (let i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        while (candidate.length < 5) candidate.push(null)
        candidate[4] = parts[i + 1]
        break
      case 'rport':
        while (candidate.length < 6) candidate.push(null)
        candidate[5] = parseInt(parts[i + 1], 10)
        break
      case 'tcptype':
        while (candidate.length < 7) candidate.push(null)
        candidate[6] = CANDIDATE_TCP_TYPES[parts[i + 1]]
        break
      default:
        // Unknown extensions are silently ignored.
        break
    }
  }

  while (candidate.length < 8) candidate.push(null)
  candidate[7] = parseInt(parts[3], 10) // Priority last

  return candidate
}

class P2PCF extends EventEmitter {
  constructor (identifier = '', options = {}) {
    super()

    if (!identifier || identifier.length < 4) {
      throw new Error('Identifier must be at least four characters')
    }

    this.peers = new Map()
    this.msgChunks = new Map()
    this.responseWaiting = new Map()
    this.connectedClients = []
    this.identifier = identifier
    this.packages = []
    this.dataTimestamp = null
    this.lastPackages = null
    this.packageReceivedFromPeers = new Set()
    this.workerUrl =
      options.workerUrl || 'https://signaling.minddrop.workers.dev'

    if (this.workerUrl.endsWith('/')) {
      this.workerUrl = this.workerUrl.substring(0, this.workerUrl.length - 1)
    }

    this.stunIceServers = options.stunIceServers || DEFAULT_STUN_ICE
    this.turnIceServers = options.turnIceServers || DEFAULT_TURN_ICE
    this.networkChangePollIntervalMs =
      options.networkChangePollIntervalMs || 15000

    this.wrtc = getBrowserRTC()
    this.dtlsCert = null
  }

  async _init () {
    if (
      this.dtlsCert === null &&
      this.wrtc.RTCPeerConnection.generateCertificate
    ) {
      this.dtlsCert = await this.wrtc.RTCPeerConnection.generateCertificate({
        name: 'ECDSA',
        namedCurve: 'P-256'
      })
    }
  }

  _step = (function () {
    return async () => {
      console.log('hello')
    }
  })()

  /**
   * Connect to network and start discovering peers
   */
  async start () {
    await this._init()
    let [
      udpEnabled,
      isSymmetric,
      reflexiveIps,
      dtlsFingerprint
    ] = await this._getNetworkSettings(this.dtlsCert)

    this.networkSettingsInterval = setInterval(async () => {
      const [
        newUdpEnabled,
        newIsSymmetric,
        newReflexiveIps,
        newDtlsFingerprint
      ] = await this._getNetworkSettings(this.dtlsCert)

      if (
        newUdpEnabled !== udpEnabled ||
        newIsSymmetric !== isSymmetric ||
        newDtlsFingerprint !== dtlsFingerprint ||
        [...reflexiveIps].join(' ') !== [...newReflexiveIps].join(' ')
      ) {
        // Network reset, clear all peers
        this.packages.length = 0

        for (const clientId of this.peers.keys()) {
          this._removePeerByClientId(clientId)
        }

        this.dataTimestamp = null
        this.lastPackages = null
        udpEnabled = newUdpEnabled
        isSymmetric = newIsSymmetric
        reflexiveIps = newReflexiveIps
        dtlsFingerprint = newDtlsFingerprint
      }
    }, this.networkChangePollIntervalMs)

    this.stepInterval = setInterval(this._step, 500)
    this.stepFinish = () => this._step(true)

    for (const ev of iOSSafari ? ['pagehide'] : ['beforeunload', 'unload']) {
      window.addEventListener(ev, this.stepFinish)
    }

    // this.on('peer', peer => {
    //   let newpeer = false
    //   if (!this.peers.has(peer.id)) {
    //     newpeer = true
    //     this.peers.set(peer.id, new Map())
    //     this.responseWaiting.set(peer.id, new Map())
    //   }
    //   peer.on('connect', () => {
    //     /**
    //      * Multiple data channels to one peer is possible
    //      * The `peer` object actually refers to a peer with a data channel. Even though it may have same `id` (peerID) property, the data channel will be different. Different trackers giving the same "peer" will give the `peer` object with different channels.
    //      * We will store two channels in case one of them fails
    //      * A peer is removed if all data channels become unavailable
    //      */
    //     const channels = this.peers.get(peer.id)
    //     let connectedChannelCount = 0
    //     for (const peer of channels.values()) {
    //       if (!peer.connected) continue
    //       connectedChannelCount++
    //     }
    //     if (connectedChannelCount === 0) {
    //       channels.set(peer.channelName, peer)
    //       if (newpeer) {
    //         this.emit('peerconnect', peer)
    //       }
    //     } else {
    //       peer.destroy()
    //     }
    //     this._updateConnectedClients()
    //   })
    //   peer.on('data', data => {
    //     this.emit('data', peer, data)
    //     let messageId = null
    //     let u16 = null
    //     if (data.length >= CHUNK_HEADER_LENGTH_BYTES) {
    //       u16 = new Uint16Array(
    //         data.buffer,
    //         data.byteOffset,
    //         CHUNK_HEADER_LENGTH_BYTES / 2
    //       )
    //       if (u16[0] === CHUNK_MAGIC_WORD) {
    //         messageId = u16[1]
    //       }
    //     }
    //     if (messageId !== null) {
    //       try {
    //         const chunkId = u16[2]
    //         const last = u16[3] !== 0
    //         const msg = this._chunkHandler(data, messageId, chunkId, last)
    //         if (last) {
    //           /**
    //            * If there's someone waiting for a response, call them
    //            */
    //           if (this.responseWaiting.get(peer.id).has(messageId)) {
    //             this.responseWaiting.get(peer.id).get(messageId)([peer, msg])
    //             this.responseWaiting.get(peer.id).delete(messageId)
    //           } else {
    //             this.emit('msg', peer, msg)
    //           }
    //           this._destroyChunks(messageId)
    //         }
    //       } catch (e) {
    //         console.error(e)
    //       }
    //     } else {
    //       this.emit('msg', peer, data)
    //     }
    //   })
    //   peer.on('error', err => {
    //     this._removePeer(peer)
    //     this._updateConnectedClients()
    //     debug('Error in connection : ' + err)
    //   })
    //   peer.on('close', () => {
    //     this._removePeer(peer)
    //     this._updateConnectedClients()
    //     debug('Connection closed with ' + peer.id)
    //   })
    // })
  }

  /**
   * Remove a peer from the list if all channels are closed
   * @param integer id Peer ID
   */
  _removePeer (peer) {
    if (!this.peers.has(peer.id)) {
      return false
    }

    this.peers.get(peer.id).delete(peer.channelName)

    // All data channels are gone. Peer lost
    if (this.peers.get(peer.id).size === 0) {
      this.emit('peerclose', peer)

      this.responseWaiting.delete(peer.id)
      this.peers.delete(peer.id)
    }
  }

  async _removePeerByClientId (clientId) {
    const { peers, packageReceivedFromPeers, packages } = this
    if (!peers.has(clientId)) return
    const peer = peers.get(clientId)
    peer.close()
    packageReceivedFromPeers.delete(clientId)
    peers.delete(clientId)

    for (let i = 0; i < packages.length; i++) {
      if (packages[i][0] === clientId) {
        packages[i] = null
      }
    }

    while (packages.indexOf(null) >= 0) {
      packages.splice(packages.indexOf(null), 1)
    }
  }

  /**
   * Send a msg and get response for it
   * @param Peer peer simple-peer object to send msg to
   * @param string msg Message to send
   * @param integer msgID ID of message if it's a response to a previous message
   */
  send (peer, msg) {
    return new Promise((resolve, reject) => {
      // if leading byte is zero
      //   next two bytes is message id, then remaining bytes
      // otherwise its just raw
      let dataArrBuffer = null

      let messageId = null

      if (msg instanceof ArrayBuffer) {
        dataArrBuffer = msg
      } else if (msg instanceof Uint8Array) {
        if (msg.buffer.byteLength === msg.length) {
          dataArrBuffer = msg.buffer
        } else {
          dataArrBuffer = msg.buffer.slice(
            msg.byteOffset,
            msg.byteLength + msg.byteOffset
          )
        }
      } else {
        throw new Error('Unsupported send data type', msg)
      }

      // If the magic word happens to be the beginning of this message, chunk it
      if (
        dataArrBuffer.byteLength > MAX_MESSAGE_LENGTH_BYTES ||
        new Uint16Array(dataArrBuffer, 0, 1) === CHUNK_MAGIC_WORD
      ) {
        messageId = Math.floor(Math.random() * 256 * 128)
      }

      try {
        /**
         * Maybe peer channel is closed, so use a different channel if available
         * Array should atleast have one channel, otherwise peer connection is closed
         */
        if (!peer.connected) {
          for (const p of this.peers.get(peer.id).values()) {
            if (!p.connected) continue
            peer = p
            break
          }
        }

        if (!this.responseWaiting.has(peer.id)) {
          this.responseWaiting.set(peer.id, new Map())
        }
        this.responseWaiting.get(peer.id).set(messageId, resolve)
      } catch (e) {
        return reject(Error('Connection to peer closed' + e))
      }

      if (messageId !== null) {
        for (
          let offset = 0, chunkId = 0;
          offset < dataArrBuffer.byteLength;
          offset += CHUNK_MAX_LENGTH_BYTES, chunkId++
        ) {
          const chunkSize = Math.min(
            CHUNK_MAX_LENGTH_BYTES,
            dataArrBuffer.byteLength - offset
          )
          const buf = new ArrayBuffer(CHUNK_HEADER_LENGTH_BYTES + chunkSize)
          new Uint8Array(buf, CHUNK_HEADER_LENGTH_BYTES).set(
            new Uint8Array(dataArrBuffer, offset, chunkSize)
          )
          const u16 = new Uint16Array(buf)
          const u32 = new Uint32Array(buf)

          u16[0] = CHUNK_MAGIC_WORD
          u16[1] = messageId
          u16[2] = chunkId
          u16[3] =
            offset + CHUNK_MAX_LENGTH_BYTES >= dataArrBuffer.byteLength ? 1 : 0
          u32[2] = dataArrBuffer.byteLength

          peer.send(buf)
        }
      } else {
        peer.send(dataArrBuffer)
      }

      debug('sent a message to ' + peer.id)
    })
  }

  broadcast (msg) {
    const ps = []

    for (const channels of this.peers.values()) {
      for (const peer of channels.values()) {
        if (!peer.connected) continue

        ps.push(this.send(peer, msg))
        break
      }
    }

    return Promise.all(ps)
  }

  /**
   * Destroy object
   */
  destroy () {
    if (this.networkSettingsInterval) {
      clearInterval(this.networkSettingsInterval)
      this.networkSettingsInterval = null
    }

    if (this.stepInterval) {
      clearInterval(this.stepInterval)
      this.stepInterval = null
    }

    if (this.stepFinish) {
      for (const ev of iOSSafari ? ['pagehide'] : ['beforeunload', 'unload']) {
        window.removeEventListener(ev, this.stepFinish)
      }

      this.stepFinish = null
    }

    for (const channels of this.peers.values()) {
      for (const peer of channels.values()) {
        peer.destroy()
      }
    }
  }

  /**
   * Handle msg chunks. Returns false until the last chunk is received. Finally returns the entire msg
   * @param object data
   */
  _chunkHandler (data, messageId, chunkId) {
    let target = null

    if (!this.msgChunks.has(messageId)) {
      const totalLength = new Uint32Array(data.buffer, data.byteOffset, 3)[2]
      target = new Uint8Array(totalLength)
      this.msgChunks.set(messageId, target)
    } else {
      target = this.msgChunks.get(messageId)
    }

    target.set(
      new Uint8Array(data.buffer, data.byteOffset + CHUNK_HEADER_LENGTH_BYTES),
      chunkId * CHUNK_MAX_LENGTH_BYTES
    )

    return target
  }

  /**
   * Remove all stored chunks of a particular message
   * @param integer msgID Message ID
   */
  _destroyChunks (msgID) {
    this.msgChunks.delete(msgID)
  }

  /**
   * Initialize trackers and fetch peers
   */
  _fetchPeers () {}

  _updateConnectedClients () {
    this.connectedClients.length = 0

    for (const [peerId, channels] of this.peers) {
      for (const peer of channels.values()) {
        if (peer.connected) {
          this.connectedClients.push(peerId)
          continue
        }
      }
    }
  }

  async _getNetworkSettings () {
    await this._init()

    let dtlsFingerprint = null
    const candidates = []
    const reflexiveIps = new Set()

    const peerOptions = { iceServers: this.stunIceServers }

    if (this.dtlsCert) {
      peerOptions.certificates = [this.dtlsCert]
    }

    const pc = new this.wrtc.RTCPeerConnection(peerOptions)
    pc.createDataChannel('x')

    const p = new Promise(resolve => {
      // 5 second timeout
      setTimeout(() => resolve(), 5000)

      pc.onicecandidate = e => {
        if (!e.candidate) return resolve()

        if (e.candidate.candidate) {
          candidates.push(parseCandidate(e.candidate.candidate))
        }
      }
    })

    pc.createOffer().then(offer => {
      for (const l of offer.sdp.split('\n')) {
        if (l.indexOf('a=fingerprint') === -1) continue
        dtlsFingerprint = l.split(' ')[1].trim()
      }

      pc.setLocalDescription(offer)
    })

    await p

    pc.close()

    let isSymmetric = false
    let udpEnabled = false

    // Network is not symmetric if we can find a srflx candidate that has a unique related port
    /* eslint-disable no-labels */
    loop: for (const c of candidates) {
      /* eslint-enable no-labels */
      if (c[0] !== CANDIDATE_TYPES.srflx) continue
      udpEnabled = true

      reflexiveIps.add(c[CANDIDATE_IDX.IP])

      for (const d of candidates) {
        if (d[0] !== CANDIDATE_TYPES.srflx) continue
        if (c === d) continue

        if (
          typeof c[CANDIDATE_IDX.RELATED_PORT] === 'number' &&
          typeof d[CANDIDATE_IDX.RELATED_PORT] === 'number' &&
          c[CANDIDATE_IDX.RELATED_PORT] === d[CANDIDATE_IDX.RELATED_PORT] &&
          c[CANDIDATE_IDX.PORT] !== d[CANDIDATE_IDX.PORT]
        ) {
          // check port and related port
          // Symmetric, continue
          isSymmetric = true
          break
        }
      }
    }

    return [udpEnabled, isSymmetric, reflexiveIps, dtlsFingerprint]
  }
}

module.exports = P2PCF
