'use strict'

const BaseError = require('./base')

class ServerError extends BaseError {
  constructor (code, serverMessages) {
    super(code, 'Unable to process the provisioning call due to a problem with PathFinder server')
    this.addServerMessages(serverMessages)
  }
}

module.exports = ServerError
