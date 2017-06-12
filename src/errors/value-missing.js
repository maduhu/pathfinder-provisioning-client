'use strict'

const BaseError = require('./base')

class ValueMissingError extends BaseError {
  constructor (code, serverMessages) {
    super(code, 'Required attributue value is missing')
    this.addServerMessages(serverMessages)
  }
}

module.exports = ValueMissingError
