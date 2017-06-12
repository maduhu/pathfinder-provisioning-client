'use strict'

const BaseError = require('./base')

class UnhandledCodeError extends BaseError {
  constructor (code, serverMessages) {
    super(code, `Received unhandled return code: ${code}`)
    this.addServerMessages(serverMessages)
  }
}

module.exports = UnhandledCodeError
