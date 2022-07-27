const BrowserP2PCF = require('./p2pcf')
const wrtc = require('wrtc')

class P2PCF extends BrowserP2PCF {
  constructor (identifierString = '') {
    super(identifierString)

    this._wrtc = wrtc
  }
}

module.exports = P2PCF
