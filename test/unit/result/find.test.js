'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const FindResult = require(`${src}/result/find`)

Test('Result', resultTest => {
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
              ReturnCode: { '_': '201' },
              TextMessage: [
                { '_': 'Created' },
                { '_': 'Profile TESTDFSP16 successfully created' },
                { '_': 'Date: Tue May 30 18:54:10 GMT 2017' }
              ],
              ResponseData: {
                DNSProfileData: {
                  ProfileID: profileId,
                  Tier: tier,
                  Customer: { '$': { id: customerId } },
                  IsInUse: 'False',
                  DateCreated: dateCreated,
                  NAPTR: [{
                    '$': { ttl },
                    DomainName: domain,
                    Order: order.toString(),
                    Preference: preference.toString(),
                    Flags: flags,
                    Service: service,
                    Regexp: { '$': { pattern: regexpPattern }, '_': regexpReplace },
                    Replacement: replacement,
                    Partner: { '$': { id: partnerId } }
                  }]
                }
              }
            }
          }
        }
      }

      let findResult = new FindResult(soapResponse)
      test.equal(findResult.code, 201)

      let findData = findResult.data
      test.equal(findData.customerId, customerId)
      test.notOk(findData.isInUse)
      test.equal(findData.created, dateCreated)
      test.equal(findData.profile.id, profileId)
      test.equal(findData.profile.tier, tier)
      test.equal(findData.profile.records.length, 1)

      let recordData = findData.profile.records[0]
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
              ReturnCode: { '_': '201' },
              TextMessage: [
                { '_': 'Created' },
                { '_': 'Profile TESTDFSP16 successfully created' },
                { '_': 'Date: Tue May 30 18:54:10 GMT 2017' }
              ],
              ResponseData: {
                DNSProfileData: {
                  ProfileID: profileId,
                  Customer: { '$': { id: customerId } },
                  IsInUse: 'False',
                  DateCreated: dateCreated,
                  NAPTR: {
                    '$': { ttl },
                    DomainName: domain,
                    Order: order.toString(),
                    Preference: preference.toString(),
                    Flags: flags,
                    Service: service,
                    Regexp: { '$': { pattern: regexpPattern }, '_': regexpReplace },
                    Replacement: replacement,
                    Partner: { '$': { id: partnerId } }
                  }
                }
              }
            }
          }
        }
      }

      let findResult = new FindResult(soapResponse)
      test.equal(findResult.code, 201)

      let findData = findResult.data
      test.equal(findData.customerId, customerId)
      test.notOk(findData.isInUse)
      test.equal(findData.created, dateCreated)
      test.equal(findData.profile.id, profileId)
      test.equal(findData.profile.records.length, 1)

      let recordData = findData.profile.records[0]
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
