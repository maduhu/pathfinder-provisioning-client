'use strict'

class NoProfileRecordsError extends Error {
  constructor () {
    super('Profile must contain at least one record')
  }
}

module.exports = NoProfileRecordsError
