'use strict'

class BaseError extends Error {
  constructor (code, message = '') {
    super(message)
    this.code = code
    this.name = this.constructor.name

    this.serverMessages = []

    Error.captureStackTrace(this, this.constructor)
  }

  addServerMessages (messages) {
    this.serverMessages = this.serverMessages.concat(messages)
  }
}

module.exports = BaseError
