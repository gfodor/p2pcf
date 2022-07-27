const { bytesToHex } = require('convert-hex')
const { decode: base64ToArrayBuffer } = require('base64-arraybuffer')

const base64ToHex = b64 => bytesToHex(base64ToArrayBuffer(b64))

export const createSdp = (isOffer, iceUFrag, icePwd, dtlsFingerprintBase64) => {
  const dtlsHex = base64ToHex(dtlsFingerprintBase64)
  let dtlsFingerprint = ''

  for (let i = 0; i < dtlsHex.length; i += 2) {
    dtlsFingerprint += `${dtlsHex[i]}${dtlsHex[i + 1]}${
      i === dtlsHex.length - 2 ? '' : ':'
    }`.toUpperCase()
  }

  const sdp = [
    'v=0',
    'o=- 5498186869896684180 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=msid-semantic: WMS',
    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
    'c=IN IP4 0.0.0.0',
    'a=mid:0',
    'a=sctp-port:5000'
  ]

  if (isOffer) {
    sdp.push('a=setup:actpass')
  } else {
    sdp.push('a=setup:active')
  }

  sdp.push(`a=ice-ufrag:${iceUFrag}`)
  sdp.push(`a=ice-pwd:${icePwd}`)
  sdp.push(`a=fingerprint:sha-256 ${dtlsFingerprint}`)

  return sdp.join('\r\n') + '\r\n'
}
