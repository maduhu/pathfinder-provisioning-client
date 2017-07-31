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
      test.equal(record.flags, 'U')

      test.end()
    })

    constructorTest.end()
  })

  recordTest.test('toSoap should', toSoapTest => {
    toSoapTest.test('convert record to object for SOAP API', test => {
      let record = new Record({ order: 10, preference: 1, service: 'E2U+mm', partnerId: 10305, regexp: { pattern: '^.*$', replace: 'mm:001.504@leveloneproject.org' } })

      let soapRecord = record.toSoap()
      test.equal(soapRecord['$'].ttl, record.ttl)
      test.equal(soapRecord.DomainName, record.domain)
      test.equal(soapRecord.Preference, record.preference)
      test.equal(soapRecord.Order, record.order)
      test.equal(soapRecord.Flags, record.flags)
      test.equal(soapRecord.Service, record.service)
      test.equal(soapRecord.Replacement, record.replacement)
      test.equal(soapRecord.CountryCode, false)
      test.equal(soapRecord.Regexp['$'].pattern, record.regexp.pattern)
      test.equal(soapRecord.Regexp['_'], record.regexp.replace)
      test.equal(soapRecord.Partner['$'].id, record.partnerId)
      test.notOk(soapRecord.Partner['_'])
      test.end()
    })

    toSoapTest.test('handle partner id for all', test => {
      let record = new Record({ order: 10, preference: 1, service: 'E2U+mm', regexp: { pattern: '^.*$', replace: 'mm:001.504@leveloneproject.org' } })

      let soapRecord = record.toSoap()
      test.equal(soapRecord.Partner['$'].id, record.partnerId)
      test.equal(soapRecord.Partner['_'], 'ALL')
      test.end()
    })

    toSoapTest.test('convert RegExp to string with no leading or trailing slashes', test => {
      let record = new Record({ order: 10, preference: 1, service: 'E2U+mm', regexp: { pattern: RegExp(/^.*$/), replace: 'mm:001.504@leveloneproject.org' } })

      let soapRecord = record.toSoap()
      test.equal(soapRecord.Regexp['$'].pattern, '^.*$')
      test.equal(soapRecord.Regexp['_'], record.regexp.replace)

      test.end()
    })

    toSoapTest.end()
  })

  recordTest.end()
})
