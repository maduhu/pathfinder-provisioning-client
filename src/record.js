'use strict'

class Record {
  constructor (opts) {
    this.order = opts.order
    this.preference = opts.preference
    this.service = opts.service
    this.regexp = opts.regexp

    this.ttl = opts.ttl || 900
    this.domain = opts.domain || 'e164enum.net'
    this.replacement = opts.replacement || '.'
    this.partnerId = opts.partnerId || -1
    this.flags = opts.flags || 'u'
  }

  toSoap () {
    return {
      '$': { ttl: this.ttl },
      'DomainName': this.domain,
      'Preference': this.preference,
      'Order': this.order,
      'Flags': this.flags,
      'Service': this.service,
      'Regexp': this._createRegexpField(),
      'Replacement': this.replacement,
      'CountryCode': false,
      'Partner': this._createPartnerField()
    }
  }

  _createPartnerField () {
    let partner = { '$': { id: this.partnerId } }
    if (this.partnerId === -1) {
      partner['_'] = 'ALL'
    }
    return partner
  }

  _createRegexpField () {
    let pattern = this.regexp.pattern
    if (pattern instanceof RegExp) {
      pattern = pattern.toString().replace(/^\/|\/$/g, '')
    }
    return { '$': { pattern }, '_': this.regexp.replace }
  }
}

module.exports = Record
