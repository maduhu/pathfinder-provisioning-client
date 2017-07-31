'use strict'

const ServerError = require('./server')
const NotFoundError = require('./not-found')
const BadRequestError = require('./bad-request')
const HttpStatusError = require('./http-status')
const UnauthorizedError = require('./unauthorized')
const InvalidValueError = require('./invalid-value')
const ValueMissingError = require('./value-missing')
const UnhandledCodeError = require('./unhandled-code')
const NoProfileRecordsError = require('./no-profile-records')
const ServiceUnavailableError = require('./service-unavailable')
const InvalidPhoneNumberError = require('./invalid-phone-number')

module.exports = {
  ServerError,
  NotFoundError,
  BadRequestError,
  HttpStatusError,
  UnauthorizedError,
  InvalidValueError,
  ValueMissingError,
  UnhandledCodeError,
  NoProfileRecordsError,
  ServiceUnavailableError,
  InvalidPhoneNumberError
}
