'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Proxyquire = require('proxyquire')

Test('Result', resultTest => {
  let sandbox
  let baseResultSpy
  let findResultSpy
  let Result

  resultTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()

    baseResultSpy = sandbox.spy()
    findResultSpy = sandbox.spy()
    Result = Proxyquire(`${src}/result`, { './base': baseResultSpy, './find': findResultSpy })

    t.end()
  })

  resultTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  resultTest.test('buildBaseResult should', baseResultTest => {
    baseResultTest.test('create base result', test => {
      let soapResponse = {}
      Result.buildBaseResult(soapResponse)

      test.ok(baseResultSpy.calledWithNew())
      test.ok(baseResultSpy.calledWith(soapResponse))
      test.end()
    })

    baseResultTest.end()
  })

  resultTest.test('buildFindResult should', findResultTest => {
    findResultTest.test('create find result', test => {
      let soapResponse = {}
      Result.buildFindResult(soapResponse)

      test.ok(findResultSpy.calledWithNew())
      test.ok(findResultSpy.calledWith(soapResponse))
      test.end()
    })

    findResultTest.end()
  })

  resultTest.end()
})
