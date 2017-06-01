'use strict'

const P = require('bluebird')
const LibPhoneNumber = require('google-libphonenumber')
const PhoneNumberUtil = LibPhoneNumber.PhoneNumberUtil
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

  deactivatePhoneNumber (phone) {
    return P.try(() => {
      let parsed = this._parsePhoneNumber(phone)
      if (!parsed.isValid) {
        throw new Error('Invalid phone number cannot be deactivated')
      }

      let body = { 'TN': this._createPhoneNumberField(parsed), 'Tier': 2 }

      return this._sendRequest(this._buildRequest('Deactivate', body)).then(Result.buildBaseResult)
    })
  }

  activatePhoneNumber (phone, profileId) {
    return P.try(() => {
      let parsed = this._parsePhoneNumber(phone)
      if (!parsed.isValid) {
        throw new Error('Invalid phone number cannot be activated')
      }

      let body = { 'TN': this._createPhoneNumberField(parsed), 'Status': 'active', 'DNSProfileID': profileId, 'Tier': 2 }

      return this._sendRequest(this._buildRequest('Activate', body)).then(Result.buildBaseResult)
    })
  }

  findProfile (profileId) {
    return this._sendRequest(this._buildRequest('QueryDNSProfile', { 'ProfileID': profileId })).then(Result.buildFindResult)
  }

  createProfile (profile) {
    return this._createOrUpdateProfile('DefineDNSProfile', profile)
  }

  updateProfile (profile) {
    return this._createOrUpdateProfile('UpdateDNSProfile', profile)
  }

  _createOrUpdateProfile (method, profile) {
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

  _createPhoneNumberField (parsed) {
    return { 'Base': parsed.nationalNumber, 'CountryCode': parsed.countryCode }
  }

  _parsePhoneNumber (phone) {
    const phoneUtil = PhoneNumberUtil.getInstance()

    const cleaned = phone.replace(/[^\d]/g, '')
    const parsed = phoneUtil.parse(`+${cleaned}`)
    return { countryCode: parsed.getCountryCode(), nationalNumber: parsed.getNationalNumber(), isValid: phoneUtil.isValidNumber(parsed) }
  }
}

module.exports = Client
