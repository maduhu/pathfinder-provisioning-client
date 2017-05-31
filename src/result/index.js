'use strict'

const BaseResult = require('./base')
const FindResult = require('./find')

exports.buildBaseResult = soapResponse => {
  return new BaseResult(soapResponse)
}

exports.buildFindResult = (soapResponse) => {
  return new FindResult(soapResponse)
}
