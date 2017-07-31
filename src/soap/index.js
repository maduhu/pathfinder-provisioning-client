'use strict'

const P = require('bluebird')
const Request = require('request')
const Xml = require('./xml')
const Errors = require('../errors')

class SoapClient {
  request (url, operation, body, options) {
    const xml = this._envelope(operation, body, options)

    const requestOptions = {
      url,
      body: xml
    }

    return P.promisify(Request.post, { multiArgs: true })(requestOptions)
      .spread((response, body) => {
        if (response.statusCode !== 200) {
          throw new Errors.HttpStatusError(response.statusCode, body)
        }
        return Xml.toJs(body)
      })
  }

  _envelope (operation, body, options) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?><env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">'
    xml += '<env:Body>'
    xml += '<' + operation + (options.namespace ? ' xmlns="' + options.namespace + '"' : '') + '>'
    xml += this._bodyToXml(body)
    xml += '</' + operation + '>'
    xml += '</env:Body>'
    xml += '</env:Envelope>'

    return xml
  }

  _bodyToXml (body) {
    return Xml.toXml(body)
  }
}

module.exports = new SoapClient()
