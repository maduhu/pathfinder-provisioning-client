'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const P = require('bluebird')
const Proxyquire = require('proxyquire')

Test('XmlConverter', xmlConverterTest => {
  let sandbox
  let parserStub
  let builderStub
  let buildObjectStub
  let promisifyStub
  let XmlConverter

  xmlConverterTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()

    parserStub = sandbox.stub()
    builderStub = sandbox.stub()
    buildObjectStub = sandbox.stub()
    builderStub.returns({ buildObject: buildObjectStub })

    promisifyStub = sandbox.stub()

    XmlConverter = Proxyquire(`${src}/soap/xml`, { 'xml2js': { Builder: builderStub, Parser: parserStub }, 'bluebird': { promisify: promisifyStub } })

    t.end()
  })

  xmlConverterTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  xmlConverterTest.test('constructor should', constructorTest => {
    constructorTest.test('configure builder and parser', test => {
      test.ok(parserStub.calledWithNew())
      test.ok(parserStub.calledWith(Sinon.match({ explicitArray: false, tagNameProcessors: [XmlConverter._parseTagName] })))
      test.ok(builderStub.calledWithNew())
      test.ok(builderStub.calledWith({ headless: true }))
      test.end()
    })

    constructorTest.end()
  })

  xmlConverterTest.test('toJs should', toJsTest => {
    toJsTest.test('call parseString method on parser', test => {
      const xml = '<root>parse me</root>'

      const parsed = { root: 'parse me' }
      let parseStringStub = sandbox.stub().returns(P.resolve(parsed))
      promisifyStub.returns(parseStringStub)

      XmlConverter.toJs(xml)
        .then(p => {
          test.ok(parseStringStub.calledWith(xml))
          test.equal(p, parsed)
          test.end()
        })
    })

    toJsTest.end()
  })

  xmlConverterTest.test('toXml should', toXmlTest => {
    toXmlTest.test('call buildObject method on builder', test => {
      const obj = { root: 'parse me' }

      const xml = '<root>parse me</root>'
      buildObjectStub.returns(xml)

      let x = XmlConverter.toXml(obj)
      test.ok(buildObjectStub.calledWith(obj))
      test.equal(x, xml)
      test.end()
    })

    toXmlTest.end()
  })

  xmlConverterTest.test('_parseTagName should', parseTagNameTest => {
    parseTagNameTest.test('remove namespace from tag name', test => {
      const tagName = 'Envelope'
      const tagNameWithNs = `soap:${tagName}`

      let parsed = XmlConverter._parseTagName(tagNameWithNs)
      test.ok(parsed, tagName)
      test.end()
    })

    parseTagNameTest.end()
  })

  xmlConverterTest.end()
})
