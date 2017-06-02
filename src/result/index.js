'use strict'

const BaseResult = require('./base')
const QueryNumberResult = require('./query-number')
const QueryProfileResult = require('./query-profile')

exports.base = soapResponse => {
  return new BaseResult(soapResponse)
}

exports.queryNumber = (soapResponse) => {
  return new QueryNumberResult(soapResponse)
}

exports.queryProfile = (soapResponse) => {
  return new QueryProfileResult(soapResponse)
}
