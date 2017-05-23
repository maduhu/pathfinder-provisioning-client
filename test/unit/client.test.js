'use strict'

const src = '../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const Handsoap = require('handsoap')
const Client = require(`${src}/client`)

Test('Client', clientTest => {
  let sandbox

  clientTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()
    sandbox.stub(Handsoap, 'request')
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
    findProfileTest.test('send SOAP request and return response', test => {
      let opts = { address: 'test.com' }
      let profileName = 'MyProfile'

      let result = {}
      Handsoap.request.returns(P.resolve(result))

      let client = createClient(opts)

      client.findProfile(profileName)
        .then(res => {
          let message = Handsoap.request.firstCall.args[3]
          test.ok(message.QueryDNSProfile)
          test.ok(message.QueryDNSProfile.TransactionID)
          test.equal(message.QueryDNSProfile.ProfileID, profileName)
          test.ok(Handsoap.request.calledWith(client._address, client._operation, client._action, message, client._options))
          test.equal(res, result)
          test.end()
        })
    })

    findProfileTest.end()
  })

  clientTest.end()
})
