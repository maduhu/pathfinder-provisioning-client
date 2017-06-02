'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const QueryProfileResult = require(`${src}/result/query-profile`)

Test('QueryProfileResult', resultTest => {
  let sandbox

  resultTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()
    t.end()
  })

  resultTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  resultTest.test('constructor should', constructorTest => {
    constructorTest.test('handle error with no ResponseData', test => {
      let soapResponse = {
        Envelope: {
          Body: {
            Response: {
              ReturnCode: { '_': '404' },
              TextMessage: [
                { '_': 'Not Found' },
                { '_': 'DNS profile does not exist' },
                { '_': 'Date: Tue May 30 18:54:10 GMT 2017' }
              ]
            }
          }
        }
      }

      let queryProfileResult = new QueryProfileResult(soapResponse)
      test.equal(queryProfileResult.code, 404)
      test.deepEqual(queryProfileResult.data, {})
      test.end()
    })

    constructorTest.test('parse response and set data field', test => {
      let profileId = 'TestDFSP'
      let tier = 3
      let customerId = 222
      let dateCreated = '2017-05-25T21:45:57.021Z'
      let ttl = 800
      let domain = 'domain'
      let order = 10
      let preference = 50
      let flags = 't'
      let service = 'E2U+mm'
      let regexpPattern = '^(.*)$'
      let regexpReplace = 'mm:001.504@leveloneproject.org'
      let replacement = '.'
      let partnerId = 333

      let soapResponse = {
        Envelope: {
          Body: {
            Response: {
              ReturnCode: { '_': '200' },
              TextMessage: [
                { '_': 'OK' },
                { '_': 'DNS profile queried successfully' },
                { '_': 'Date: Tue May 30 18:54:10 GMT 2017' }
              ],
              ResponseData: {
                DNSProfileData: {
                  ProfileID: profileId,
                  Tier: tier.toString(),
                  Customer: { '$': { id: customerId.toString() } },
                  IsInUse: 'False',
                  DateCreated: dateCreated,
                  NAPTR: [{
                    '$': { ttl: ttl.toString() },
                    DomainName: domain,
                    Order: order.toString(),
                    Preference: preference.toString(),
                    Flags: flags,
                    Service: service,
                    Regexp: { '$': { pattern: regexpPattern }, '_': regexpReplace },
                    Replacement: replacement,
                    Partner: { '$': { id: partnerId.toString() } }
                  }]
                }
              }
            }
          }
        }
      }

      let queryProfileResult = new QueryProfileResult(soapResponse)
      test.equal(queryProfileResult.code, 200)

      let queryProfileData = queryProfileResult.data
      test.equal(queryProfileData.customerId, customerId)
      test.notOk(queryProfileData.isInUse)
      test.equal(queryProfileData.created, dateCreated)
      test.equal(queryProfileData.profile.id, profileId)
      test.equal(queryProfileData.profile.tier, tier)
      test.equal(queryProfileData.profile.records.length, 1)

      let recordData = queryProfileData.profile.records[0]
      test.equal(recordData.ttl, ttl)
      test.equal(recordData.domain, domain)
      test.equal(recordData.order, order)
      test.equal(recordData.preference, preference)
      test.equal(recordData.flags, flags)
      test.equal(recordData.service, service)
      test.equal(recordData.regexp.pattern, regexpPattern)
      test.equal(recordData.regexp.replace, regexpReplace)
      test.equal(recordData.replacement, replacement)
      test.equal(recordData.partnerId, partnerId)
      test.end()
    })

    constructorTest.test('handle single NAPTR record', test => {
      let profileId = 'TestDFSP'
      let customerId = 222
      let dateCreated = '2017-05-25T21:45:57.021Z'
      let ttl = 800
      let domain = 'domain'
      let order = 10
      let preference = 50
      let flags = 't'
      let service = 'E2U+mm'
      let regexpPattern = '^(.*)$'
      let regexpReplace = 'mm:001.504@leveloneproject.org'
      let replacement = '.'
      let partnerId = 333

      let soapResponse = {
        Envelope: {
          Body: {
            Response: {
              ReturnCode: { '_': '200' },
              TextMessage: [
                { '_': 'OK' },
                { '_': 'DNS profile queried successfully' },
                { '_': 'Date: Tue May 30 18:54:10 GMT 2017' }
              ],
              ResponseData: {
                DNSProfileData: {
                  ProfileID: profileId,
                  Customer: { '$': { id: customerId.toString() } },
                  IsInUse: 'False',
                  DateCreated: dateCreated,
                  NAPTR: {
                    '$': { ttl: ttl.toString() },
                    DomainName: domain,
                    Order: order.toString(),
                    Preference: preference.toString(),
                    Flags: flags,
                    Service: service,
                    Regexp: { '$': { pattern: regexpPattern }, '_': regexpReplace },
                    Replacement: replacement,
                    Partner: { '$': { id: partnerId.toString() } }
                  }
                }
              }
            }
          }
        }
      }

      let queryProfileResult = new QueryProfileResult(soapResponse)
      test.equal(queryProfileResult.code, 200)

      let queryResultData = queryProfileResult.data
      test.equal(queryResultData.customerId, customerId)
      test.notOk(queryResultData.isInUse)
      test.equal(queryResultData.created, dateCreated)
      test.equal(queryResultData.profile.id, profileId)
      test.equal(queryResultData.profile.records.length, 1)

      let recordData = queryResultData.profile.records[0]
      test.equal(recordData.ttl, ttl)
      test.equal(recordData.domain, domain)
      test.equal(recordData.order, order)
      test.equal(recordData.preference, preference)
      test.equal(recordData.flags, flags)
      test.equal(recordData.service, service)
      test.equal(recordData.regexp.pattern, regexpPattern)
      test.equal(recordData.regexp.replace, regexpReplace)
      test.equal(recordData.replacement, replacement)
      test.equal(recordData.partnerId, partnerId)
      test.end()
    })

    constructorTest.end()
  })

  resultTest.end()
})
