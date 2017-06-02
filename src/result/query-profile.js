'use strict'

const BaseResult = require('./base')
const Record = require('../record')
const Profile = require('../profile')

class QueryProfileResult extends BaseResult {
  parseData (soapResponse) {
    if (!soapResponse.Envelope.Body.Response.ResponseData) return {}

    let profileData = soapResponse.Envelope.Body.Response.ResponseData.DNSProfileData
    return {
      customerId: parseInt(profileData.Customer['$'].id),
      created: profileData.DateCreated,
      isInUse: profileData.IsInUse.toLowerCase() === 'true',
      profile: this._parseProfile(profileData)
    }
  }

  _parseProfile (profileData) {
    let naptrRecords = Array.isArray(profileData.NAPTR) ? profileData.NAPTR : [profileData.NAPTR]
    return new Profile({ id: profileData.ProfileID, tier: parseInt(profileData.Tier), records: naptrRecords.map(this._parseNaptrRecord) })
  }

  _parseNaptrRecord (naptrData) {
    return new Record({
      order: parseInt(naptrData.Order),
      preference: parseInt(naptrData.Preference),
      service: naptrData.Service,
      regexp: { pattern: naptrData.Regexp['$'].pattern, replace: naptrData.Regexp['_'] },
      ttl: parseInt(naptrData['$'].ttl),
      domain: naptrData.DomainName,
      replacement: naptrData.Replacement,
      partnerId: parseInt(naptrData.Partner['$'].id),
      flags: naptrData.Flags
    })
  }
}

module.exports = QueryProfileResult
