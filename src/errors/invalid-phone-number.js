'use strict'

class InvalidPhoneNumberError extends Error {
  constructor () {
    super('The phone number is invalid')
  }
}

module.exports = InvalidPhoneNumberError
