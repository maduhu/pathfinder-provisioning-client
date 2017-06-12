'use strict'

const BaseError = require('./base')

class ServiceUnavailableError extends BaseError {
  constructor (code, serverMessages) {
    super(code, 'The server is currently unable to handle the request due to a temporary overload or maintenance on the server')
    this.addServerMessages(serverMessages)
  }
}

module.exports = ServiceUnavailableError
