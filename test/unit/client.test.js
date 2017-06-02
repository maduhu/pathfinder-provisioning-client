'use strict'

const src = '../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const SoapClient = require(`${src}/soap`)
const Profile = require(`${src}/profile`)
const Result = require(`${src}/result`)
const Phone = require(`${src}/phone`)
const Client = require(`${src}/client`)

Test('Client', clientTest => {
  let sandbox

  clientTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()
    sandbox.stub(SoapClient, 'request')
    sandbox.stub(Result, 'queryNumber')
    sandbox.stub(Result, 'queryProfile')
    sandbox.stub(Result, 'base')
    sandbox.stub(Phone, 'parse')
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

      let queryProfileResult = { code: 200 }
      Result.queryProfile.returns(queryProfileResult)

      let client = createClient(opts)

      client.findProfile(profileId)
        .then(res => {
          let message = SoapClient.request.firstCall.args[3]
          test.ok(message.QueryDNSProfile)
          test.ok(message.QueryDNSProfile.TransactionID)
          test.equal(message.QueryDNSProfile.ProfileID, profileId)
          test.ok(SoapClient.request.calledWith(client._address, client._operation, client._action, message, client._options))
          test.ok(Result.queryProfile.calledWith(result))
          test.equal(res, queryProfileResult)
          test.end()
        })
    })

    findProfileTest.end()
  })

  clientTest.test('createProfile should', createProfileTest => {
    createProfileTest.test('send DefineDNSProfile message and return response', test => {
      let opts = { address: 'test.com' }
      let profile = new Profile({ id: 'Test', records: [{}] })

      let soapProfile = { 'Test': 'test' }
      profile.toSoap = sandbox.stub().returns(soapProfile)

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let baseResult = { code: 201 }
      Result.base.returns(baseResult)

      let client = createClient(opts)

      client.createProfile(profile)
        .then(res => {
          let message = SoapClient.request.firstCall.args[3]
          test.ok(message.DefineDNSProfile)

          let defineRecord = message.DefineDNSProfile
          test.ok(defineRecord.TransactionID)
          test.equal(defineRecord.Test, 'test')

          test.ok(Result.base.calledWith(result))
          test.equal(res, baseResult)

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
      let profile = new Profile({ id: 'Test', records: [{}] })

      let soapProfile = { 'Test': 'test' }
      profile.toSoap = sandbox.stub().returns(soapProfile)

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let baseResult = { code: 201 }
      Result.base.returns(baseResult)

      let client = createClient(opts)

      client.updateProfile(profile)
        .then(res => {
          let message = SoapClient.request.firstCall.args[3]
          test.ok(message.UpdateDNSProfile)

          let defineRecord = message.UpdateDNSProfile
          test.ok(defineRecord.TransactionID)
          test.equal(defineRecord.Test, 'test')

          test.ok(Result.base.calledWith(result))
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

      Phone.parse.returns({ nationalNumber, countryCode })

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let baseResult = { code: 200 }
      Result.base.returns(baseResult)

      let client = createClient(opts)

      client.activatePhoneNumber(phoneNumber, profileId)
        .then(res => {
          test.ok(Phone.parse.calledWith(phoneNumber))

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
          test.ok(Result.base.calledWith(result))
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
      Phone.parse.throws(parseError)

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

    activateNumberTest.end()
  })

  clientTest.test('deactivatePhoneNumber should', deactivateNumberTest => {
    deactivateNumberTest.test('send Deactivate message and return response', test => {
      let opts = { address: 'test.com' }
      let countryCode = 1
      let nationalNumber = 5158675309
      let phoneNumber = `+${countryCode}${nationalNumber}`

      Phone.parse.returns({ nationalNumber, countryCode })

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let baseResult = { code: 200 }
      Result.base.returns(baseResult)

      let client = createClient(opts)

      client.deactivatePhoneNumber(phoneNumber)
        .then(res => {
          test.ok(Phone.parse.calledWith(phoneNumber))

          let message = SoapClient.request.firstCall.args[3]
          test.ok(message.Deactivate)
          test.ok(message.Deactivate.TransactionID)
          test.ok(message.Deactivate.TN)
          test.equal(message.Deactivate.TN.Base, nationalNumber)
          test.equal(message.Deactivate.TN.CountryCode, countryCode)
          test.equal(message.Deactivate.Tier, 2)
          test.ok(SoapClient.request.calledWith(client._address, client._operation, client._action, message, client._options))
          test.ok(Result.base.calledWith(result))
          test.equal(res, baseResult)
          test.end()
        })
    })

    deactivateNumberTest.test('handle parse error', test => {
      let opts = { address: 'test.com' }
      let countryCode = 1
      let nationalNumber = 5158675309
      let phoneNumber = `+${countryCode}${nationalNumber}`

      let parseError = new Error('The phone number is too long')
      Phone.parse.throws(parseError)

      let client = createClient(opts)

      client.deactivatePhoneNumber(phoneNumber)
        .then(res => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(err => {
          test.equal(err, parseError)
          test.end()
        })
    })

    deactivateNumberTest.end()
  })

  clientTest.test('getProfileForPhoneNumber should', getProfileTest => {
    getProfileTest.test('send QueryTN message and return response', test => {
      let opts = { address: 'test.com' }
      let countryCode = 1
      let nationalNumber = 5158675309
      let phoneNumber = `+${countryCode}${nationalNumber}`

      Phone.parse.returns({ nationalNumber, countryCode })

      let result = {}
      SoapClient.request.returns(P.resolve(result))

      let queryNumberResult = { code: 200 }
      Result.queryNumber.returns(queryNumberResult)

      let client = createClient(opts)

      client.getProfileForPhoneNumber(phoneNumber)
        .then(res => {
          test.ok(Phone.parse.calledWith(phoneNumber))

          let message = SoapClient.request.firstCall.args[3]
          test.ok(message.QueryTN)
          test.ok(message.QueryTN.TransactionID)
          test.ok(message.QueryTN.TN)
          test.equal(message.QueryTN.TN.Base, nationalNumber)
          test.equal(message.QueryTN.TN.CountryCode, countryCode)
          test.equal(message.QueryTN.Tier, 2)
          test.ok(SoapClient.request.calledWith(client._address, client._operation, client._action, message, client._options))
          test.ok(Result.queryNumber.calledWith(result))
          test.equal(res, queryNumberResult)
          test.end()
        })
    })

    getProfileTest.test('handle parse error', test => {
      let opts = { address: 'test.com' }
      let countryCode = 1
      let nationalNumber = 5158675309
      let phoneNumber = `+${countryCode}${nationalNumber}`

      let parseError = new Error('The phone number is too long')
      Phone.parse.throws(parseError)

      let client = createClient(opts)

      client.getProfileForPhoneNumber(phoneNumber)
        .then(res => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(err => {
          test.equal(err, parseError)
          test.end()
        })
    })

    getProfileTest.end()
  })

  clientTest.end()
})
