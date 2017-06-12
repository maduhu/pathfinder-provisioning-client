'use strict'

const BaseError = require('./base')

class InvalidValueError extends BaseError {
  constructor (code, serverMessages) {
    super(code, 'One or more request values is invalid')
    this.addServerMessages(serverMessages)
  }
}

module.exports = InvalidValueError
