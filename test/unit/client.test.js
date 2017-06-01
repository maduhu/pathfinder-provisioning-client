'use strict'

const src = '../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const SoapClient = require(`${src}/soap`)
const Record = require(`${src}/record`)
const Profile = require(`${src}/profile`)
const Result = require(`${src}/result`)
const Proxyquire = require('proxyquire')

Test('Client', clientTest => {
  let sandbox
  let Client
  let PhoneNumberUtil
  let phoneUtilInstance

  clientTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()
    sandbox.stub(SoapClient, 'request')
    sandbox.stub(Result, 'buildFindResult')
    sandbox.stub(Result, 'buildBaseResult')

    phoneUtilInstance = { parse: sandbox.stub(), isValidNumber: sandbox.stub() }
    PhoneNumberUtil = { getInstance: sandbox.stub().returns(phoneUtilInstance) }

    Client = Proxyquire(`${src}/client`, { 'google-libphonenumber': { PhoneNumberUtil } })

    t.end()
  })

  clientTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  const createClient = (opts) => {
    return new Client(opts || {})
  }

  clientTest.test('constructor should', createClientTest => {
    createClientTest.test('create client using provided options', test => {
      let opts = { address: 'test.com', operation: 'op', namespace: 'ns', action: 'action' }

      let client = createClient(opts)

      test.equal(client._address, opts.address)
      test.equal(client._operation, opts.operation)
      test.equal(client._namespace, opts.namespace)
      test.equal(client._action, opts.action)
      test.deepEqual(client._options, { namespace: opts.namespace })
      test.end()
    })

    createClientTest.test('create client using default options', test => {
      let opts = { address: 'test.com' }

      let client = createClient(opts)

      test.equal(client._address, opts.address)
      test.equal(client._operation, 'Request')
      test.equal(client._namespace, 'http://www.neustar.biz/sip_ix/prov')
      test.equal(client._action, '')
      test.deepEqual(client._options, { namespace: client._namespace })
      test.end()
    })

    createClientTest.end()
  })

  clientTest.test('findProfile should', findProfileTest => {
    findProfileTest.test('send QueryDNSProfile messsage and return response', test => {
      let opts = { address: 'test.com' }
      let profileId = 'MyProfile'

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let findResult = { code: 200 }
      Result.buildFindResult.returns(findResult)

      let client = createClient(opts)

      client.findProfile(profileId)
        .then(res => {
          let message = SoapClient.request.firstCall.args[3]
          test.ok(message.QueryDNSProfile)
          test.ok(message.QueryDNSProfile.TransactionID)
          test.equal(message.QueryDNSProfile.ProfileID, profileId)
          test.ok(SoapClient.request.calledWith(client._address, client._operation, client._action, message, client._options))
          test.ok(Result.buildFindResult.calledWith(result))
          test.equal(res, findResult)
          test.end()
        })
    })

    findProfileTest.end()
  })

  clientTest.test('createProfile should', createProfileTest => {
    createProfileTest.test('send DefineDNSProfile message and return response', test => {
      let opts = { address: 'test.com' }
      let record = new Record({ order: 10, preference: 1, service: 'E2U+mm', partnerId: 10305, regexp: { pattern: '^.*$', replace: 'mm:001.504@leveloneproject.org' } })
      let profile = new Profile({ id: 'Test', records: [record] })

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let baseResult = { code: 201 }
      Result.buildBaseResult.returns(baseResult)

      let client = createClient(opts)

      client.createProfile(profile)
        .then(res => {
          let message = SoapClient.request.firstCall.args[3]
          test.ok(message.DefineDNSProfile)

          let defineRecord = message.DefineDNSProfile
          test.ok(defineRecord.TransactionID)
          test.equal(defineRecord.ProfileID, profile.id)
          test.equal(defineRecord.Tier, profile.tier)
          test.equal(defineRecord.NAPTR.length, 1)

          let naptrRecord = defineRecord.NAPTR[0]
          test.equal(naptrRecord['$'].ttl, record.ttl)
          test.equal(naptrRecord.DomainName, record.domain)
          test.equal(naptrRecord.Preference, record.preference)
          test.equal(naptrRecord.Order, record.order)
          test.equal(naptrRecord.Flags, record.flags)
          test.equal(naptrRecord.Service, record.service)
          test.equal(naptrRecord.Replacement, record.replacement)
          test.equal(naptrRecord.CountryCode, false)
          test.equal(naptrRecord.Regexp['$'].pattern, record.regexp.pattern)
          test.equal(naptrRecord.Regexp['_'], record.regexp.replace)
          test.equal(naptrRecord.Partner['$'].id, record.partnerId)
          test.notOk(naptrRecord.Partner['_'])

          test.ok(Result.buildBaseResult.calledWith(result))
          test.equal(res, baseResult)

          test.end()
        })
    })

    createProfileTest.test('handle partner id for all', test => {
      let opts = { address: 'test.com' }
      let record = new Record({ order: 10, preference: 1, service: 'E2U+mm', regexp: { pattern: '^.*$', replace: 'mm:001.504@leveloneproject.org' } })
      let profile = new Profile({ id: 'Test', records: [record] })

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let baseResult = { code: 201 }
      Result.buildBaseResult.returns(baseResult)

      let client = createClient(opts)

      client.createProfile(profile)
        .then(res => {
          let message = SoapClient.request.firstCall.args[3]
          let defineRecord = message.DefineDNSProfile

          let naptrRecord = defineRecord.NAPTR[0]
          test.equal(naptrRecord.Partner['$'].id, record.partnerId)
          test.equal(naptrRecord.Partner['_'], 'ALL')

          test.end()
        })
    })

    createProfileTest.test('convert RegExp to string with no leading or trailing slashes', test => {
      let opts = { address: 'test.com' }
      let record = new Record({ order: 10, preference: 1, service: 'E2U+mm', regexp: { pattern: RegExp(/^.*$/), replace: 'mm:001.504@leveloneproject.org' } })
      let profile = new Profile({ id: 'Test', records: [record] })

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let baseResult = { code: 201 }
      Result.buildBaseResult.returns(baseResult)

      let client = createClient(opts)

      client.createProfile(profile)
        .then(res => {
          let message = SoapClient.request.firstCall.args[3]
          let defineRecord = message.DefineDNSProfile

          let naptrRecord = defineRecord.NAPTR[0]
          test.equal(naptrRecord.Regexp['$'].pattern, '^.*$')
          test.equal(naptrRecord.Regexp['_'], record.regexp.replace)

          test.end()
        })
    })

    createProfileTest.test('throw error if no records in profile', test => {
      let opts = { address: 'test.com' }
      let profile = new Profile({ id: 'test' })

      let client = createClient(opts)

      client.createProfile(profile)
        .then(res => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(err => {
          test.equal(err.message, 'Profile must contain at least one record')
          test.end()
        })
    })

    createProfileTest.end()
  })

  clientTest.test('updateProfile should', updateProfileTest => {
    updateProfileTest.test('send UpdateDNSProfile message and return response', test => {
      let opts = { address: 'test.com' }
      let record = new Record({ order: 10, preference: 1, service: 'E2U+mm', partnerId: 10305, regexp: { pattern: '^.*$', replace: 'mm:001.504@leveloneproject.org' } })
      let profile = new Profile({ id: 'Test', records: [record] })

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let baseResult = { code: 201 }
      Result.buildBaseResult.returns(baseResult)

      let client = createClient(opts)

      client.updateProfile(profile)
        .then(res => {
          let message = SoapClient.request.firstCall.args[3]
          test.ok(message.UpdateDNSProfile)

          let defineRecord = message.UpdateDNSProfile
          test.ok(defineRecord.TransactionID)
          test.equal(defineRecord.ProfileID, profile.id)
          test.equal(defineRecord.Tier, profile.tier)
          test.equal(defineRecord.NAPTR.length, 1)

          let naptrRecord = defineRecord.NAPTR[0]
          test.equal(naptrRecord['$'].ttl, record.ttl)
          test.equal(naptrRecord.DomainName, record.domain)
          test.equal(naptrRecord.Preference, record.preference)
          test.equal(naptrRecord.Order, record.order)
          test.equal(naptrRecord.Flags, record.flags)
          test.equal(naptrRecord.Service, record.service)
          test.equal(naptrRecord.Replacement, record.replacement)
          test.equal(naptrRecord.CountryCode, false)
          test.equal(naptrRecord.Regexp['$'].pattern, record.regexp.pattern)
          test.equal(naptrRecord.Regexp['_'], record.regexp.replace)
          test.equal(naptrRecord.Partner['$'].id, record.partnerId)
          test.notOk(naptrRecord.Partner['_'])

          test.ok(Result.buildBaseResult.calledWith(result))
          test.equal(res, baseResult)

          test.end()
        })
    })

    updateProfileTest.end()
  })

  clientTest.test('activatePhoneNumber should', activateNumberTest => {
    activateNumberTest.test('send Activate message and return response', test => {
      let opts = { address: 'test.com' }
      let profileId = 'MyProfile'
      let countryCode = 1
      let nationalNumber = 5158675309
      let phoneNumber = `+${countryCode}${nationalNumber}`

      let parsed = sandbox.stub()
      parsed.getCountryCode = sandbox.stub().returns(countryCode)
      parsed.getNationalNumber = sandbox.stub().returns(nationalNumber)

      phoneUtilInstance.parse.returns(parsed)
      phoneUtilInstance.isValidNumber.returns(true)

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let baseResult = { code: 200 }
      Result.buildBaseResult.returns(baseResult)

      let client = createClient(opts)

      client.activatePhoneNumber(phoneNumber, profileId)
        .then(res => {
          let message = SoapClient.request.firstCall.args[3]
          test.ok(message.Activate)
          test.ok(message.Activate.TransactionID)
          test.ok(message.Activate.TN)
          test.equal(message.Activate.TN.Base, nationalNumber)
          test.equal(message.Activate.TN.CountryCode, countryCode)
          test.equal(message.Activate.DNSProfileID, profileId)
          test.equal(message.Activate.Status, 'active')
          test.equal(message.Activate.Tier, 2)
          test.ok(SoapClient.request.calledWith(client._address, client._operation, client._action, message, client._options))
          test.ok(Result.buildBaseResult.calledWith(result))
          test.equal(res, baseResult)
          test.end()
        })
    })

    activateNumberTest.test('handle parse error', test => {
      let opts = { address: 'test.com' }
      let profileId = 'MyProfile'
      let countryCode = 1
      let nationalNumber = 5158675309
      let phoneNumber = `+${countryCode}${nationalNumber}`

      let parseError = new Error('The phone number is too long')
      phoneUtilInstance.parse.throws(parseError)

      let client = createClient(opts)

      client.activatePhoneNumber(phoneNumber, profileId)
        .then(res => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(err => {
          test.equal(err, parseError)
          test.end()
        })
    })

    activateNumberTest.test('throw error if invalid number', test => {
      let opts = { address: 'test.com' }
      let profileId = 'MyProfile'
      let countryCode = 1
      let nationalNumber = 5158675309
      let phoneNumber = `+${countryCode}${nationalNumber}`

      let parsed = sandbox.stub()
      parsed.getCountryCode = sandbox.stub().returns(countryCode)
      parsed.getNationalNumber = sandbox.stub().returns(nationalNumber)

      phoneUtilInstance.parse.returns(parsed)
      phoneUtilInstance.isValidNumber.returns(false)

      let client = createClient(opts)

      client.activatePhoneNumber(phoneNumber, profileId)
        .then(res => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(err => {
          test.equal(err.message, 'Invalid phone number cannot be activated')
          test.end()
        })
    })

    activateNumberTest.end()
  })

  clientTest.end()
})
