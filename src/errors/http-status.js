'use strict'

class HttpStatusError extends Error {
  constructor (statusCode, body) {
    super(`Error with HTTP status code ${statusCode}: ${body}`)
  }
}

module.exports = HttpStatusError
