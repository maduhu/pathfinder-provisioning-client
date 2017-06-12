'use strict'

const BaseError = require('./base')

class UnauthorizedError extends BaseError {
  constructor (code, serverMessages) {
    super(code, 'Client lacks privileges to execute the requested operation')
    this.addServerMessages(serverMessages)
  }
}

module.exports = UnauthorizedError
