'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const BaseResult = require(`${src}/result/base`)

Test('BaseResult', baseResultTest => {
  let sandbox

  baseResultTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()
    t.end()
  })

  baseResultTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  baseResultTest.test('constructor should', constructorTest => {
    constructorTest.test('parse and set fields from SOAP response', test => {
      let returnCode = 201
      let message1 = 'test'
      let message2 = 'test more'

      let soapResponse = {
        Envelope: {
          Body: {
            Response: {
              ReturnCode: { '_': returnCode.toString() },
              TextMessage: [
                { '_': message1 },
                { '_': message2 }
              ]
            }
          }
        }
      }

      let baseResult = new BaseResult(soapResponse)
      test.equal(baseResult.code, returnCode)
      test.equal(baseResult.messages.length, 2)
      test.equal(baseResult.messages[0], message1)
      test.equal(baseResult.messages[1], message2)
      test.deepEqual(baseResult.data, {})
      test.end()
    })

    constructorTest.end()
  })

  baseResultTest.end()
})
