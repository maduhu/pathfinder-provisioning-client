'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const Proxyquire = require('proxyquire')

Test('SoapClient', soapClientTest => {
  let sandbox
  let postStub
  let toJsStub
  let toXmlStub
  let promisifyStub
  let SoapClient

  soapClientTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()

    postStub = sandbox.stub()
    toJsStub = sandbox.stub()
    toXmlStub = sandbox.stub()
    promisifyStub = sandbox.stub()

    SoapClient = Proxyquire(`${src}/soap`, { 'request': { post: postStub }, './xml': { toJs: toJsStub, toXml: toXmlStub }, 'bluebird': { promisify: promisifyStub } })

    t.end()
  })

  soapClientTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  soapClientTest.test('request should', requestTest => {
    requestTest.test('convert js to xml and make soap call', test => {
      let url = 'http://test.com'
      let op = 'Request'
      let action = ''
      let ns = 'http://www.neustar.biz/sip_ix/prov'

      let obj = { root: 'hello' }
      let xml = '<root>hello</root>'

      toXmlStub.returns(xml)

      let response = { statusCode: 200 }
      let responseXml = '<response>stuff</response>'
      postStub.returns(P.resolve([response, responseXml]))
      promisifyStub.returns(postStub)

      let responseObj = {}
      toJsStub.returns(P.resolve(responseObj))

      SoapClient.request(url, op, action, obj, { namespace: ns })
        .then(r => {
          test.ok(promisifyStub.calledWith(postStub, Sinon.match({ multiArgs: true })))
          test.ok(postStub.calledWith(Sinon.match({
            url,
            body: `<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"><env:Body><${op} xmlns="${ns}">${xml}</${op}></env:Body></env:Envelope>`
          })))
          test.ok(toXmlStub.calledWith(obj))
          test.ok(toJsStub.calledWith(responseXml))
          test.equal(r, responseObj)
          test.end()
        })
    })

    requestTest.test('handle no namespace for operation', test => {
      let url = 'http://test.com'
      let op = 'Request'
      let action = ''

      let obj = { root: 'hello' }
      let xml = '<root>hello</root>'

      toXmlStub.returns(xml)

      let response = { statusCode: 200 }
      let responseXml = '<response>stuff</response>'
      postStub.returns(P.resolve([response, responseXml]))
      promisifyStub.returns(postStub)

      let responseObj = {}
      toJsStub.returns(P.resolve(responseObj))

      SoapClient.request(url, op, action, obj, {})
        .then(r => {
          test.ok(postStub.calledWith(Sinon.match({
            url,
            body: `<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"><env:Body><${op}>${xml}</${op}></env:Body></env:Envelope>`
          })))
          test.equal(r, responseObj)
          test.end()
        })
    })

    requestTest.test('throw error if soap call response code not 200', test => {
      let url = 'http://test.com'
      let op = 'Request'
      let action = ''
      let ns = 'http://www.neustar.biz/sip_ix/prov'

      let obj = { root: 'hello' }
      let xml = '<root>hello</root>'

      toXmlStub.returns(xml)

      let response = { statusCode: 500 }
      let responseXml = '<response>stuff</response>'
      postStub.returns(P.resolve([response, responseXml]))
      promisifyStub.returns(postStub)

      SoapClient.request(url, op, action, obj, { namespace: ns })
        .then(r => {
          test.fail('Should have thrown error')
          test.end()
        })
        .catch(err => {
          test.equal(err.message, `Error with HTTP status code ${response.statusCode}: ${responseXml}`)
          test.end()
        })
    })

    requestTest.end()
  })

  soapClientTest.end()
})
