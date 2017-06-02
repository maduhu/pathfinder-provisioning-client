'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Proxyquire = require('proxyquire')

Test('Result', resultTest => {
  let sandbox
  let baseResultSpy
  let queryNumberResultSpy
  let queryProfileResultSpy
  let Result

  resultTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()

    baseResultSpy = sandbox.spy()
    queryNumberResultSpy = sandbox.spy()
    queryProfileResultSpy = sandbox.spy()
    Result = Proxyquire(`${src}/result`, { './base': baseResultSpy, './query-number': queryNumberResultSpy, './query-profile': queryProfileResultSpy })

    t.end()
  })

  resultTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  resultTest.test('base should', baseTest => {
    baseTest.test('create base result', test => {
      let soapResponse = {}
      Result.base(soapResponse)

      test.ok(baseResultSpy.calledWithNew())
      test.ok(baseResultSpy.calledWith(soapResponse))
      test.end()
    })

    baseTest.end()
  })

  resultTest.test('queryProfile should', queryProfileTest => {
    queryProfileTest.test('create query profile result', test => {
      let soapResponse = {}
      Result.queryProfile(soapResponse)

      test.ok(queryProfileResultSpy.calledWithNew())
      test.ok(queryProfileResultSpy.calledWith(soapResponse))
      test.end()
    })

    queryProfileTest.end()
  })

  resultTest.test('queryNumber should', queryNumberTest => {
    queryNumberTest.test('create query number result', test => {
      let soapResponse = {}
      Result.queryNumber(soapResponse)

      test.ok(queryNumberResultSpy.calledWithNew())
      test.ok(queryNumberResultSpy.calledWith(soapResponse))
      test.end()
    })

    queryNumberTest.end()
  })

  resultTest.end()
})
