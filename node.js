const BrowserP2PCF = require('./p2pcf')
const wrtc = require('wrtc')

class P2PCF extends BrowserP2PCF {
  constructor (clientId = '', roomId = '', options = {}) {
    super(clientId, roomId, options)

    this.wrtc = wrtc
  }
}

module.exports = P2PCF
