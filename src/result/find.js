'use strict'

const BaseResult = require('./base')
const Record = require('../record')
const Profile = require('../profile')

class FindResult extends BaseResult {
  parseData (soapResponse) {
    let soapProfile = soapResponse.Envelope.Body.Response.ResponseData.DNSProfileData
    return {
      customerId: parseInt(soapProfile.Customer['$'].id),
      created: soapProfile.DateCreated,
      isInUse: soapProfile.IsInUse.toLowerCase() === 'true',
      profile: this._parseProfile(soapProfile)
    }
  }

  _parseProfile (soapProfile) {
    let naptrRecords = Array.isArray(soapProfile.NAPTR) ? soapProfile.NAPTR : [soapProfile.NAPTR]
    return new Profile({ id: soapProfile.ProfileID, tier: parseInt(soapProfile.Tier), records: naptrRecords.map(this._parseNaptrRecord) })
  }

  _parseNaptrRecord (naptrRecord) {
    return new Record({
      order: parseInt(naptrRecord.Order),
      preference: parseInt(naptrRecord.Preference),
      service: naptrRecord.Service,
      regexp: { pattern: naptrRecord.Regexp['$'].pattern, replace: naptrRecord.Regexp['_'] },
      ttl: parseInt(naptrRecord['$'].ttl),
      domain: naptrRecord.DomainName,
      replacement: naptrRecord.Replacement,
      partnerId: parseInt(naptrRecord.Partner['$'].id),
      flags: naptrRecord.Flags
    })
  }
}

module.exports = FindResult
