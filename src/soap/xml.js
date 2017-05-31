'use strict'

const P = require('bluebird')
const Xml2Js = require('xml2js')

class XmlConverter {
  constructor () {
    this._parser = this._configureParser()
    this._builder = this._configureBuilder()
  }

  _configureBuilder () {
    const options = { headless: true }
    return new Xml2Js.Builder(options)
  }

  _configureParser () {
    const options = {
      explicitArray: false,
      tagNameProcessors: [this._parseTagName]
    }

    return new Xml2Js.Parser(options)
  }

  toJs (xml) {
    return P.promisify(this._parser.parseString)(xml)
  }

  toXml (obj) {
    return this._builder.buildObject(obj)
  }

  _parseTagName (name) {
    return name.slice(name.indexOf(':') + 1, name.length)
  }
}

module.exports = new XmlConverter()
