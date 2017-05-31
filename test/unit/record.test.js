'use strict'

const src = '../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Record = require(`${src}/record`)

Test('Record', recordTest => {
  let sandbox

  recordTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()
    t.end()
  })

  recordTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  recordTest.test('constructor should', constructorTest => {
    constructorTest.test('set supplied options', test => {
      let opts = {
        order: 10,
        preference: 1,
        service: 'E2U+mm',
        regexp: {
          pattern: '^.*$',
          replace: 'mm:001.504@leveloneproject.org'
        },
        ttl: 1200,
        domain: 'mydomain',
        replacement: 'replace',
        partnerId: 10305,
        flags: 't'
      }

      let record = new Record(opts)
      test.equal(record.order, opts.order)
      test.equal(record.preference, opts.preference)
      test.equal(record.service, opts.service)
      test.equal(record.regexp.pattern, opts.regexp.pattern)
      test.equal(record.regexp.replace, opts.regexp.replace)
      test.equal(record.ttl, opts.ttl)
      test.equal(record.domain, opts.domain)
      test.equal(record.replacement, opts.replacement)
      test.equal(record.partnerId, opts.partnerId)
      test.equal(record.flags, opts.flags)

      test.end()
    })

    constructorTest.test('set default options if not supplied', test => {
      let opts = {
        order: 10,
        preference: 1,
        service: 'E2U+mm',
        regexp: {
          pattern: '^.*$',
          replace: 'mm:001.504@leveloneproject.org'
        }
      }

      let record = new Record(opts)
      test.equal(record.ttl, 900)
      test.equal(record.domain, 'e164enum.net')
      test.equal(record.replacement, '.')
      test.equal(record.partnerId, -1)
      test.equal(record.flags, 'u')

      test.end()
    })

    constructorTest.end()
  })

  recordTest.end()
})
