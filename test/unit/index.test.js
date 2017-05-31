'use strict'

const src = '../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Proxyquire = require('proxyquire')

Test('Index', indexTest => {
  let sandbox
  let clientSpy
  let recordSpy
  let profileSpy
  let Index

  indexTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()

    clientSpy = sandbox.spy()
    recordSpy = sandbox.spy()
    profileSpy = sandbox.spy()
    Index = Proxyquire(src, { './client': clientSpy, './profile': profileSpy, './record': recordSpy })

    t.end()
  })

  indexTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  indexTest.test('createClient should', createClientTest => {
    createClientTest.test('create client with supplied options', test => {
      let opts = { address: 'localhost' }
      Index.createClient(opts)

      test.ok(clientSpy.calledWithNew())
      test.ok(clientSpy.calledWith(opts))
      test.end()
    })

    createClientTest.test('create client with empty options if not supplied', test => {
      Index.createClient()

      test.ok(clientSpy.calledWithNew())
      test.ok(clientSpy.calledWith({}))
      test.end()
    })

    createClientTest.end()
  })

  indexTest.test('Profile should', profileTest => {
    profileTest.test('create Profile with supplied options', test => {
      let opts = { id: 'test' }
      Index.Profile(opts)

      test.ok(profileSpy.calledWithNew())
      test.ok(profileSpy.calledWith(opts))
      test.end()
    })

    profileTest.test('create Profile with empty options if not supplied', test => {
      Index.Profile()

      test.ok(profileSpy.calledWithNew())
      test.ok(profileSpy.calledWith({}))
      test.end()
    })

    profileTest.end()
  })

  indexTest.test('Record should', recordTest => {
    recordTest.test('create Record with supplied options', test => {
      let opts = { ttl: 100 }
      Index.Record(opts)

      test.ok(recordSpy.calledWithNew())
      test.ok(recordSpy.calledWith(opts))
      test.end()
    })

    recordTest.test('create Record with empty options if not supplied', test => {
      Index.Record()

      test.ok(recordSpy.calledWithNew())
      test.ok(recordSpy.calledWith({}))
      test.end()
    })

    recordTest.end()
  })

  indexTest.end()
})
