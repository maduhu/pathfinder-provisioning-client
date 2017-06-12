'use strict'

const BaseError = require('./base')

class NotFoundError extends BaseError {
  constructor (code, serverMessages) {
    super(code, 'The requested resource could not be found')
    this.addServerMessages(serverMessages)
  }
}

module.exports = NotFoundError
