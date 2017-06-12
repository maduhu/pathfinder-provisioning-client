'use strict'

const P = require('bluebird')
const BaseResult = require('./base')
const QueryNumberResult = require('./query-number')
const QueryProfileResult = require('./query-profile')
const Errors = require('../errors')

const ValidCodes = [200, 201, 202]
const ErrorCodeMappings = {
  400: Errors.BadRequestError,
  401: Errors.UnauthorizedError,
  404: Errors.NotFoundError,
  420: Errors.InvalidValueError,
  421: Errors.ValueMissingError,
  500: Errors.ServerError,
  503: Errors.ServiceUnavailableError
}

exports.base = (soapResponse) => {
  return handleSoapResponse(soapResponse, BaseResult)
}

exports.queryNumber = (soapResponse) => {
  return handleSoapResponse(soapResponse, QueryNumberResult)
}

exports.queryProfile = (soapResponse) => {
  return handleSoapResponse(soapResponse, QueryProfileResult)
}

const handleSoapResponse = (soapResponse, ResultClass) => {
  return new P((resolve, reject) => {
    const result = new ResultClass(soapResponse)
    if (ValidCodes.indexOf(result.code) > -1) {
      resolve(result)
    } else {
      const MappedError = ErrorCodeMappings[result.code]
      if (MappedError) {
        reject(new MappedError(result.code, result.messages))
      } else {
        reject(new Errors.UnhandledCodeError(result.code, result.messages))
      }
    }
  })
}
