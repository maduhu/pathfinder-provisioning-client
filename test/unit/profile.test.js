'use strict'

const src = '../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Profile = require(`${src}/profile`)

Test('Profile', profileTest => {
  let sandbox

  profileTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()
    t.end()
  })

  profileTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  profileTest.test('constructor should', constructorTest => {
    constructorTest.test('set supplied options', test => {
      let opts = { id: 'test', tier: 3, records: [{}] }

      let profile = new Profile(opts)
      test.equal(profile.id, opts.id)
      test.equal(profile.tier, opts.tier)
      test.equal(profile.records, opts.records)

      test.end()
    })

    constructorTest.test('set default options if not supplied', test => {
      let opts = { id: 'test' }

      let profile = new Profile(opts)
      test.equal(profile.id, opts.id)
      test.equal(profile.tier, 2)
      test.deepEqual(profile.records, [])

      test.end()
    })

    constructorTest.test('do not set records prop if not array', test => {
      let opts = { id: 'test', records: {} }

      let profile = new Profile(opts)
      test.equal(profile.id, opts.id)
      test.deepEqual(profile.records, [])

      test.end()
    })

    constructorTest.end()
  })

  profileTest.test('addRecord should', addRecordTest => {
    addRecordTest.test('append record to list', test => {
      let opts = { id: 'test', records: [{}] }

      let profile = new Profile(opts)
      test.equal(profile.records.length, 1)

      profile.addRecord({})
      test.equal(profile.records.length, 2)

      test.end()
    })

    addRecordTest.end()
  })

  profileTest.end()
})