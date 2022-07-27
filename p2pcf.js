/**
 * Peer 2 Peer WebRTC connections with Cloudflare Workers as signalling server
 * Copyright Greg Fodor <gfodor@gmail.com>
 * Licensed under MIT
 */

const getBrowserRTC = require('get-browser-rtc')
const EventEmitter = require('events')
const debug = require('debug')('p2pcf')
const pako = require('pako')
const { encode: arrayBufferToBase64 } = require('base64-arraybuffer')
const { hexToBytes } = require('convert-hex')
const { createSdp } = require('./utils')
const randomstring = require('randomstring')
require('isomorphic-fetch')

const hexToBase64 = hex => arrayBufferToBase64(hexToBytes(hex))

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
const iOSSafari = !!(iOS && webkit && !ua.match(/CriOS/i))
const isFirefox = !!(
  global.navigator?.userAgent.toLowerCase().indexOf('firefox') > -1
)

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
  constructor (clientId = '', roomId = '', options = {}) {
    super()

    if (!clientId || clientId.length < 4) {
      throw new Error('Client ID must be at least four characters')
    }

    if (!roomId || roomId.length < 4) {
      throw new Error('Room ID must be at least four characters')
    }

    this._step = this._step.bind(this)

    this.peers = new Map()
    this.msgChunks = new Map()
    this.responseWaiting = new Map()
    this.connectedClients = []
    this.clientId = clientId
    this.roomId = roomId
    this.packages = []
    this.dataTimestamp = null
    this.lastPackages = null
    this.packageReceivedFromPeers = new Set()
    this.lastReceivedDataTimestamps = new Map()
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

    this.stateExpirationIntervalMs =
      options.stateExpirationIntervalMs || 2 * 60 * 1000
    this.stateHeartbeatWindowMs = options.stateHeartbeatWindowMs || 30000

    this.fastPollingDurationMs = options.fastPollingDurationMs || 10000
    this.fastPollingRateMs = options.fastPollingRateMs || 750
    this.slowPollingRateMs = options.slowPollingRateMs || 5000

    this.wrtc = getBrowserRTC()
    this.dtlsCert = null
    this.udpEnabled = null
    this.isSymmetric = null
    this.reflexiveIps = null
    this.dtlsFingerprint = null

    // ContextID is maintained across page refreshes
    if (global.history) {
      if (!global.history.state?._p2pcfContextId) {
        global.history.replaceState(
          {
            ...global.history.state,
            _p2pcfContextId: randomstring.generate({ length: 20 })
          },
          global.window.location.href
        )
      }

      this.contextId = global.history.state.contextId
    } else {
      this.contextId = randomstring.generate(20)
    }
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
    const startedTimestamp = new Date().getTime()

    let isSending = false
    let finished = false
    let nextStepTime = -1
    let deleteKey = null
    let sentFirstPoll = false
    let stopFastPollingAt = -1

    return async function (finish = false) {
      const {
        clientId,
        roomId,
        contextId,
        stateExpirationIntervalMs,
        stateHeartbeatWindowMs,
        packages,
        fastPollingDurationMs,
        fastPollingRateMs,
        slowPollingRateMs
      } = this

      const now = new Date().getTime()

      if (finish) {
        if (finished) return
        finished = true
      } else {
        if (nextStepTime > now) return
        if (isSending) return
        if (this.reflexiveIps.length === 0) return
      }

      isSending = true

      try {
        const localDtlsFingerprintBase64 = hexToBase64(
          this.dtlsFingerprint.replaceAll(':', '')
        )

        const localPeerInfo = [
          clientId,
          this.isSymmetric,
          localDtlsFingerprintBase64,
          startedTimestamp,
          [...this.reflexiveIps]
        ]

        const payload = { r: roomId, k: contextId }

        if (finish) {
          payload.dk = deleteKey
        }

        const expired =
          this.dataTimestamp === null ||
          now - this.dataTimestamp >=
            stateExpirationIntervalMs - stateHeartbeatWindowMs

        const packagesChanged = this.lastPackages !== JSON.stringify(packages)
        let includePackages = false

        if (expired || packagesChanged || finish) {
          // This will force a write
          this.dataTimestamp = now

          // Compact packages, expire any of them sent more than a minute ago.
          // (ICE will timeout by then, even if other latency fails us.)
          for (let i = 0; i < packages.length; i++) {
            const sentAt = packages[i][packages[i].length - 2]

            if (now - sentAt > 60 * 1000) {
              packages[i] = null
            }
          }

          while (packages.indexOf(null) >= 0) {
            packages.splice(packages.indexOf(null), 1)
          }

          includePackages = true
        }

        if (finish) {
          includePackages = false
        }

        // The first poll should just be a read, no writes, to build up packages before we do a write
        // to reduce worker I/O. So don't include the data + packages on the first request.
        if (sentFirstPoll) {
          payload.d = localPeerInfo
          payload.t = this.dataTimestamp
          payload.x = this.stateExpirationIntervalMs

          if (includePackages) {
            payload.p = packages
            this.lastPackages = JSON.stringify(packages)
          }
        }

        let body = JSON.stringify(payload)
        const deflatedBody = arrayBufferToBase64(pako.deflate(body))
        const headers = { 'Content-Type': 'application/json ' }
        let keepalive = false

        if (body.length > deflatedBody.length) {
          body = deflatedBody
          headers['Content-Type'] = 'application/json'
          headers['Content-Encoding'] = 'text/plain'
          headers['Content-Length'] = deflatedBody.length
        }

        if (finish) {
          headers['X-Worker-Method'] = 'DELETE'
          keepalive = true
        }

        console.log(headers, body, keepalive)

        const res = await fetch(this.workerUrl, {
          method: 'POST',
          headers,
          body,
          keepalive
        })

        const { ps: remotePeerDatas, pk: remotePackages, dk } = await res.json()

        if (dk) {
          deleteKey = dk
        }

        if (finish) return

        // Slight optimization: if the peers are empty on the first poll, immediately publish data to reduce
        // delay before first peers show up.
        if (remotePeerDatas.length === 0 && !sentFirstPoll) {
          payload.d = localPeerInfo
          payload.t = this.dataTimestamp
          payload.x = this.stateExpirationIntervalMs
          payload.p = packages
          this.lastPackages = JSON.stringify(packages)

          const res = await fetch(this.workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })

          const { dk } = await res.json()

          if (dk) {
            deleteKey = dk
          }
        }

        sentFirstPoll = true

        const previousPeerClientIds = [...this.peers.keys()]

        this._handleWorkerResponse(
          startedTimestamp,
          localPeerInfo,
          localDtlsFingerprintBase64,
          packages,
          remotePeerDatas,
          remotePackages
        )

        const activeClientIds = remotePeerDatas.map(p => p[0])

        const peersChanged =
          previousPeerClientIds.length !== activeClientIds.length ||
          activeClientIds.find(c => !previousPeerClientIds.includes(c)) ||
          previousPeerClientIds.find(c => !activeClientIds.includes(c))

        // Rate limit requests when room is empty, or look for new joins
        // Go faster when things are changing to avoid ICE timeouts
        if (peersChanged) {
          stopFastPollingAt = now + fastPollingDurationMs
        }

        if (now < stopFastPollingAt) {
          nextStepTime = now + fastPollingRateMs
        } else {
          nextStepTime = now + slowPollingRateMs
        }
      } catch (e) {
        console.error(e)
        nextStepTime = now + slowPollingRateMs
      } finally {
        isSending = false
      }
    }
  })()

  _handleWorkerResponse (
    localStartedAtTimestamp,
    localPeerData,
    localDtlsFingerprintBase64,
    localPackages,
    remotePeerDatas,
    remotePackages
  ) {
    const {
      dtlsCert: localDtlsCert,
      peers,
      lastReceivedDataTimestamps,
      packageReceivedFromPeers,
      stunIceServers,
      turnIceServers,
      wrtc
    } = this
    const [localClientId, localSymmetric] = localPeerData
    const now = new Date().getTime()

    for (const remotePeerData of remotePeerDatas) {
      const [
        remoteClientId,
        remoteSymmetric,
        remoteDtlsFingerprintBase64,
        remoteJoinedAtTimestamp,
        remoteReflexiveIps,
        remoteDataTimestamp
      ] = remotePeerData

      // Don't process the same messages twice. This covers disconnect cases where stale data re-creates a peer too early.
      if (
        lastReceivedDataTimestamps.get(remoteClientId) === remoteDataTimestamp
      ) {
        continue
      }

      lastReceivedDataTimestamps.set(remoteClientId, remoteDataTimestamp)

      // Peer A is:
      //   - if both not symmetric or both symmetric, whoever has the most recent data is peer A, since we want Peer B created faster,
      //     and latency will be lowest with older data.
      //   - if one is and one isn't, the non symmetric one is the only one who has valid candidates, so the symmetric one is peer A
      const isPeerA =
        localSymmetric === remoteSymmetric
          ? localStartedAtTimestamp > remoteJoinedAtTimestamp
          : localSymmetric

      // If either side is symmetric, use TURN and hope we avoid connecting via relays
      // We can't just use TURN if both sides are symmetric because one side might be port restricted and hence won't connect without a relay.
      const iceServers =
        localSymmetric || remoteSymmetric ? turnIceServers : stunIceServers

      // Firefox answer side is very aggressive with ICE timeouts, so always delay answer set until second candidates received.
      const delaySetRemoteUntilReceiveCandidates = isFirefox
      const remotePackage = remotePackages.find(p => p[1] === remoteClientId)

      const peerOptions = { iceServers }

      if (localDtlsCert) {
        peerOptions.certificates = [localDtlsCert]
      }

      if (isPeerA) {
        if (peers.has(remoteClientId)) continue
        if (!remotePackage) continue

        // If we already added the candidates from B, skip. This check is not strictly necessary given the peer will exist.
        if (packageReceivedFromPeers.has(remoteClientId)) continue
        packageReceivedFromPeers.add(remoteClientId)

        //  - I create PC
        //  - I create an answer SDP, and munge the ufrag
        //  - Set local description with answer
        //  - Set remote description via the received sdp
        //  - Add the ice candidates

        const [
          ,
          ,
          remoteIceUFrag,
          remoteIcePwd,
          remoteDtlsFingerprintBase64,
          localIceUFrag,
          localIcePwd,
          ,
          remoteCandidates
        ] = remotePackage

        const pc = new wrtc.RTCPeerConnection(peerOptions)
        pc.createDataChannel('p2pcf_signalling')
        peers.set(remoteClientId, pc)

        // Special case if both behind sym NAT or other hole punching isn't working: peer A needs to send its candidates as well.
        const pkg = [
          remoteClientId,
          localClientId,
          /* lfrag */ null,
          /* lpwd */ null,
          /* ldtls */ null,
          /* remote ufrag */ null,
          /* remote Pwd */ null,
          now,
          []
        ]
        const pkgCandidates = pkg[pkg.length - 1]

        pc.onicecandidate = e => {
          if (!e.candidate) {
            if (pkgCandidates.length > 0) {
              // If hole punch hasn't worked after two seconds, send these candidates back to B to help it punch through.
              localPackages.push(pkg)
            }

            return
          }

          if (!e.candidate.candidate) return
          pkgCandidates.push(e.candidate.candidate)
        }

        pc.oniceconnectionstatechange = () => {
          const iceConnectionState = pc.iceConnectionState
          const iceGatheringState = pc.iceGatheringState

          if (iceConnectionState === 'connected') {
            console.log('connected')
          } else if (iceConnectionState === 'failed') {
            this._removePeerByClientId(remoteClientId)
          }

          console.log(
            'iceconnectionstatechange',
            remoteClientId.substring(0, 5),
            iceConnectionState,
            iceGatheringState
          )
        }

        pc.onicegatheringstatechange = () => {
          const iceConnectionState = pc.iceConnectionState
          const iceGatheringState = pc.iceGatheringState
          console.log(
            'icegatheringstatechange',
            remoteClientId.substring(0, 5),
            iceConnectionState,
            iceGatheringState
          )
        }

        pc.onconnectionstatechange = () => {
          const connectionState = pc.connectionState
          console.log(
            'connectionstatechange',
            remoteClientId.substring(0, 5),
            connectionState
          )

          if (connectionState === 'connected') {
            console.log('connected2')
          } else if (connectionState === 'failed') {
            this._removePeerByClientId(remoteClientId)
          } else {
            document
              .getElementById(`${remoteClientId}-conn-status`)
              .setAttribute(
                'style',
                'width: 32px; height: 32px; background-color: yellow;'
              )
          }
        }

        pc.onsignalingstatechange = () => {
          const signalingState = pc.signalingState
          console.log(
            'signalingstatechange',
            remoteClientId.substring(0, 5),
            signalingState
          )
        }

        const remoteSdp = createSdp(
          true,
          remoteIceUFrag,
          remoteIcePwd,
          remoteDtlsFingerprintBase64
        )

        pc.setRemoteDescription({ type: 'offer', sdp: remoteSdp })

        pc.createAnswer().then(answer => {
          const lines = []

          for (const l of answer.sdp.split('\r\n')) {
            if (l.startsWith('a=ice-ufrag')) {
              lines.push(`a=ice-ufrag:${localIceUFrag}`)
            } else if (l.startsWith('a=ice-pwd')) {
              lines.push(`a=ice-pwd:${localIcePwd}`)
            } else {
              lines.push(l)
            }
          }

          pc.setLocalDescription({ type: 'answer', sdp: lines.join('\r\n') })

          console.log('Add remote candidates', remoteClientId)

          for (const candidate of remoteCandidates) {
            pc.addIceCandidate({ candidate, sdpMLineIndex: 0 })
          }
        })
      } else {
        // I am peer B, I need to create a peer first if none exists, and send a package.
        //   - Create PC
        //   - Create offer
        //   - Set local description as-is
        //   - Generate ufrag + pwd
        //   - Generate remote SDP using the dtls fingerprint for A, and my generated ufrag + pwd
        //   - Add an srflx candidate for each of the reflexive IPs for A (on a random port) to hole punch
        //   - Set remote description
        //     so peer reflexive candidates for it show up.
        //   - Let trickle run, then once trickle finishes send a package for A to pick up = [my client id, my offer sdp, generated ufrag/pwd, dtls fingerprint, ice candidates]
        //   - keep the icecandidate listener active, and add the pfrlx candidates when they arrive (but don't send another package)
        if (!peers.has(remoteClientId)) {
          const pc = new wrtc.RTCPeerConnection(peerOptions)
          pc.createDataChannel('p2pcf_signalling')
          peers.set(remoteClientId, pc)

          const remoteUfrag = randomstring.generate({ length: 12 })
          const remotePwd = randomstring.generate({ length: 32 })

          // This is the 'package' sent to peer A that it needs to start ICE
          const pkg = [
            remoteClientId,
            localClientId,
            /* lfrag */ null,
            /* lpwd */ null,
            /* ldtls */ null,
            remoteUfrag,
            remotePwd,
            now,
            []
          ]

          const pkgCandidates = pkg[pkg.length - 1]

          // Peer A posted its reflexive IPs to try to speed up hole punching by B.
          let remoteSdp = createSdp(
            false,
            remoteUfrag,
            remotePwd,
            remoteDtlsFingerprintBase64
          )

          for (let i = 0; i < remoteReflexiveIps.length; i++) {
            remoteSdp += `a=candidate:0 1 udp ${i + 1} ${
              remoteReflexiveIps[i]
            } 30000 typ srflx\r\n`
          }

          pc.onicecandidate = e => {
            // Push package onto the given package list, so it will be sent in next polling step.
            if (!e.candidate) return localPackages.push(pkg)

            if (!e.candidate.candidate) return
            pkgCandidates.push(e.candidate.candidate)
          }

          pc.oniceconnectionstatechange = () => {
            const iceConnectionState = pc.iceConnectionState
            const iceGatheringState = pc.iceGatheringState

            if (iceConnectionState === 'connected') {
              console.log('connected B')
            } else if (iceConnectionState === 'failed') {
              this._removePeerByClientId(remoteClientId)
            }

            console.log(
              'iceconnectionstatechange',
              remoteClientId.substring(0, 5),
              iceConnectionState,
              iceGatheringState
            )
          }

          pc.onicegatheringstatechange = () => {
            const iceConnectionState = pc.iceConnectionState
            const iceGatheringState = pc.iceGatheringState
            console.log(
              'icegatheringstatechange',
              remoteClientId.substring(0, 5),
              iceConnectionState,
              iceGatheringState
            )
          }

          pc.onconnectionstatechange = () => {
            const connectionState = pc.connectionState
            console.log(
              'connectionstatechange',
              remoteClientId.substring(0, 5),
              connectionState
            )

            if (connectionState === 'connected') {
              console.log('connected2 B')
            } else if (connectionState === 'failed') {
              this._removePeerByClientId(remoteClientId)
            }
          }

          pc.onsignalingstatechange = () => {
            const signalingState = pc.signalingState
            console.log(
              'signalingstatechange',
              remoteClientId.substring(0, 5),
              signalingState
            )
          }

          pc.createOffer().then(offer => {
            pc.setLocalDescription(offer)

            for (const l of offer.sdp.split('\r\n')) {
              switch (l.split(':')[0]) {
                case 'a=ice-ufrag':
                  pkg[2] = l.substring(12)
                  break
                case 'a=ice-pwd':
                  pkg[3] = l.substring(10)
                  break
                case 'a=fingerprint':
                  pkg[4] = hexToBase64(l.substring(22).replaceAll(':', ''))
                  break
              }
            }

            if (!delaySetRemoteUntilReceiveCandidates) {
              pc.setRemoteDescription({ type: 'answer', sdp: remoteSdp })
            } else {
              pc._pendingRemoteSdp = remoteSdp
            }
          })
        }

        if (!remotePackage) continue

        // Peer B will also receive candidates in the case where hole punch fails.
        // If we already added the candidates from A, skip
        const [, , , , , , , , remoteCandidates] = remotePackage
        if (packageReceivedFromPeers.has(remoteClientId)) continue
        if (!peers.has(remoteClientId)) continue

        const pc = peers.get(remoteClientId)
        if (
          delaySetRemoteUntilReceiveCandidates &&
          !pc.remoteDescription &&
          pc._pendingRemoteSdp
        ) {
          console.log('Add remote candidates', remoteClientId)

          pc.setRemoteDescription({
            type: 'answer',
            sdp: pc._pendingRemoteSdp
          }).then(() => {
            delete pc._pendingRemoteSdp

            if (pc.iceConnectionState !== 'connected') {
              for (const candidate of remoteCandidates) {
                pc.addIceCandidate({ candidate, sdpMLineIndex: 0 })
              }
            }

            packageReceivedFromPeers.add(remoteClientId)
          })

          packageReceivedFromPeers.add(remoteClientId)
        }

        if (
          !delaySetRemoteUntilReceiveCandidates &&
          pc.remoteDescription &&
          remoteCandidates.length > 0
        ) {
          console.log('Add remote candidates', remoteClientId)

          if (pc.iceConnectionState !== 'connected') {
            for (const candidate of remoteCandidates) {
              pc.addIceCandidate({ candidate, sdpMLineIndex: 0 })
            }
          }

          packageReceivedFromPeers.add(remoteClientId)
        }
      }
    }

    const remoteClientIds = remotePeerDatas.map(p => p[0])

    // Remove all peers no longer in the peer list.
    for (const clientId of peers.keys()) {
      if (remoteClientIds.includes(clientId)) continue
      this._removePeerByClientId(clientId)
    }
  }

  /**
   * Connect to network and start discovering peers
   */
  async start () {
    await this._init()

    const [
      udpEnabled,
      isSymmetric,
      reflexiveIps,
      dtlsFingerprint
    ] = await this._getNetworkSettings(this.dtlsCert)

    this.udpEnabled = udpEnabled
    this.isSymmetric = isSymmetric
    this.reflexiveIps = reflexiveIps
    this.dtlsFingerprint = dtlsFingerprint

    this.networkSettingsInterval = setInterval(async () => {
      const [
        newUdpEnabled,
        newIsSymmetric,
        newReflexiveIps,
        newDtlsFingerprint
      ] = await this._getNetworkSettings(this.dtlsCert)

      if (
        newUdpEnabled !== this.udpEnabled ||
        newIsSymmetric !== this.isSymmetric ||
        newDtlsFingerprint !== this.dtlsFingerprint ||
        [...this.reflexiveIps].join(' ') !== [...newReflexiveIps].join(' ')
      ) {
        // Network reset, clear all peers
        this.packages.length = 0

        for (const clientId of this.peers.keys()) {
          this._removePeerByClientId(clientId)
        }

        this.dataTimestamp = null
        this.lastPackages = null
        this.udpEnabled = newUdpEnabled
        this.isSymmetric = newIsSymmetric
        this.reflexiveIps = newReflexiveIps
        this.dtlsFingerprint = newDtlsFingerprint
      }
    }, this.networkChangePollIntervalMs)

    this._step = this._step.bind(this)
    this.stepInterval = setInterval(this._step, 500)
    this.stepFinish = () => this._step(true)

    if (global.window) {
      for (const ev of iOSSafari ? ['pagehide'] : ['beforeunload', 'unload']) {
        global.window.addEventListener(ev, this.stepFinish)
      }
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
      if (global.window) {
        for (const ev of iOSSafari
          ? ['pagehide']
          : ['beforeunload', 'unload']) {
          global.window.removeEventListener(ev, this.stepFinish)
        }
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
      setTimeout(() => resolve(), global.window ? 5000 : 500)

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
