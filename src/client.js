'use strict'

const P = require('bluebird')
const SoapClient = require('./soap')
const Result = require('./result')

class Client {
  constructor (opts) {
    this._address = opts.address
    this._operation = opts.operation || 'Request'
    this._namespace = opts.namespace || 'http://www.neustar.biz/sip_ix/prov'
    this._action = opts.action || ''

    this._options = { namespace: this._namespace }
  }

  findProfile (profileId) {
    return this._sendRequest(this._buildRequest('QueryDNSProfile', { 'ProfileID': profileId })).then(Result.buildFindResult)
  }

  createProfile (profile) {
    const method = 'DefineDNSProfile'

    if (profile.records.length === 0) {
      return P.reject(new Error('Profile must contain at least one record'))
    }

    let body = { 'ProfileID': profile.id, 'Tier': profile.tier, 'NAPTR': profile.records.map(this._convertRecordForSoap.bind(this)) }

    return this._sendRequest(this._buildRequest(method, body)).then(Result.buildBaseResult)
  }

  _generateTransactionId () {
    return Date.now().toString() + this._calculateRandomEntropy()
  }

  _calculateRandomEntropy () {
    const entropy = Math.floor(Math.random() * 999 + 1).toString()
    return (Array(3).join('0') + entropy).slice(-3)
  }

  _buildRequest (method, body) {
    let req = {}

    body['TransactionID'] = this._generateTransactionId()
    req[method] = body

    return req
  }

  _sendRequest (req) {
    return SoapClient.request(this._address, this._operation, this._action, req, this._options)
  }

  _convertRecordForSoap (record) {
    return {
      '$': { ttl: record.ttl },
      'DomainName': record.domain,
      'Preference': record.preference,
      'Order': record.order,
      'Flags': record.flags,
      'Service': record.service,
      'Regexp': this._createRegexpField(record),
      'Replacement': record.replacement,
      'CountryCode': false,
      'Partner': this._createPartnerField(record)
    }
  }

  _createPartnerField (record) {
    let partner = { '$': { id: record.partnerId } }
    if (record.partnerId === -1) {
      partner['_'] = 'ALL'
    }
    return partner
  }

  _createRegexpField (record) {
    let pattern = record.regexp.pattern
    if (pattern instanceof RegExp) {
      pattern = pattern.toString().replace(/^\/|\/$/g, '')
    }
    return { '$': { pattern }, '_': record.regexp.replace }
  }
}

module.exports = Client
