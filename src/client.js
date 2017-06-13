'use strict'

const P = require('bluebird')
const SoapClient = require('./soap')
const Result = require('./result')
const Phone = require('./phone')

class Client {
  constructor (opts) {
    this._address = opts.address
    this._operation = opts.operation || 'Request'
    this._namespace = opts.namespace || 'http://www.neustar.biz/sip_ix/prov'
    this._action = opts.action || ''

    this._options = { namespace: this._namespace }
  }

  getActivatedPhoneNumbers (profileId) {
    return this._sendRequest(this._buildRequest('QueryTN', { 'DNSProfileID': profileId })).then(Result.queryNumber)
  }

  getProfileForPhoneNumber (phone) {
    return this._parsePhoneNumber(phone).then(parsed => {
      const body = this._createPhoneNumberField(parsed)
      return this._sendRequest(this._buildRequest('QueryTN', body))
        .then(Result.queryNumber)
        .then(result => {
          result.data = result.data.length > 0 ? result.data.shift() : {}
          return result
        })
    })
  }

  deactivatePhoneNumber (phone) {
    return this._parsePhoneNumber(phone).then(parsed => {
      const body = this._createPhoneNumberField(parsed)
      return this._sendRequest(this._buildRequest('Deactivate', body)).then(Result.base)
    })
  }

  activatePhoneNumber (phone, profileId) {
    return this._parsePhoneNumber(phone).then(parsed => {
      const body = this._createPhoneNumberField(parsed)
      body['Status'] = 'active'
      body['DNSProfileID'] = profileId

      return this._sendRequest(this._buildRequest('Activate', body)).then(Result.base)
    })
  }

  findProfile (profileId) {
    return this._sendRequest(this._buildRequest('QueryDNSProfile', { 'ProfileID': profileId })).then(Result.queryProfile)
  }

  createProfile (profile) {
    return this._createOrUpdateProfile('DefineDNSProfile', profile)
  }

  updateProfile (profile) {
    return this._createOrUpdateProfile('UpdateDNSProfile', profile)
  }

  _parsePhoneNumber (phoneNumber) {
    return P.try(() => Phone.parse(phoneNumber))
  }

  _createOrUpdateProfile (method, profile) {
    if (profile.records.length === 0) {
      return P.reject(new Error('Profile must contain at least one record'))
    }

    const body = profile.toSoap()

    return this._sendRequest(this._buildRequest(method, body)).then(Result.base)
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

  _createPhoneNumberField (parsed) {
    return { 'TN': { 'Base': parsed.nationalNumber, 'CountryCode': parsed.countryCode }, 'Tier': 2 }
  }
}

module.exports = Client
