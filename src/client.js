'use strict'

const Handsoap = require('handsoap')

class Client {
  constructor (opts) {
    this._address = opts.address
    this._operation = opts.operation || 'Request'
    this._namespace = opts.namespace || 'http://www.neustar.biz/sip_ix/prov'
    this._action = opts.action || ''

    this._options = { namespace: this._namespace }
  }

  findProfile (profile) {
    const message = { 'QueryDNSProfile': { 'TransactionID': this._generateTransactionId(), 'ProfileID': profile } }
    return this._request(message)
  }

  _generateTransactionId () {
    return Date.now().toString() + this._calculateRandomEntropy()
  }

  _calculateRandomEntropy () {
    const entropy = Math.floor(Math.random() * 999 + 1).toString()
    return (Array(3).join('0') + entropy).slice(-3)
  }

  _request (body) {
    return Handsoap.request(this._address, this._operation, this._action, body, this._options)
  }
}

module.exports = Client
