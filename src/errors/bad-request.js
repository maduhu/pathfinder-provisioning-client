'use strict'

const BaseError = require('./base')

class BadRequestError extends BaseError {
  constructor (code, serverMessages) {
    super(code, 'Invalid request')
    this.addServerMessages(serverMessages)
  }
}

module.exports = BadRequestError
