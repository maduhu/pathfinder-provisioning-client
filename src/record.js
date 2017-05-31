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
}

module.exports = Record
