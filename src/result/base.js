'use strict'

class BaseResult {
  constructor (soapResponse) {
    this.code = this.parseReturnCode(soapResponse)
    this.messages = this.parseMessages(soapResponse)
    this.data = this.parseData(soapResponse)
  }

  parseReturnCode (soapResponse) {
    return parseInt(soapResponse.Envelope.Body.Response.ReturnCode['_'])
  }

  parseMessages (soapResponse) {
    return soapResponse.Envelope.Body.Response.TextMessage.map(m => m['_'])
  }

  parseData (soapResponse) {
    return {}
  }
}

module.exports = BaseResult
