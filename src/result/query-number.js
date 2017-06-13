'use strict'

const BaseResult = require('./base')
const Phone = require('../phone')

class QueryNumberResult extends BaseResult {
  parseData (soapResponse) {
    if (!soapResponse.Envelope.Body.Response.ResponseData) return {}

    let tnData = soapResponse.Envelope.Body.Response.ResponseData.TNData
    let numbers = Array.isArray(tnData) ? tnData : [tnData]
    return numbers.map(this._convertToRecord)
  }

  _convertToRecord (numberData) {
    return {
      customerId: parseInt(numberData.Customer['$'].id),
      created: numberData.DateCreated,
      status: numberData.Status,
      tn: Phone.format(parseInt(numberData.TN.Base), parseInt(numberData.TN.CountryCode)),
      profileId: numberData.DNSProfileID,
      tier: parseInt(numberData.Tier)
    }
  }
}

module.exports = QueryNumberResult
