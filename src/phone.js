'use strict'

const LibPhoneNumber = require('google-libphonenumber')
const Errors = require('./errors')

const PhoneNumber = LibPhoneNumber.PhoneNumber
const PhoneNumberFormat = LibPhoneNumber.PhoneNumberFormat
const PhoneNumberUtil = LibPhoneNumber.PhoneNumberUtil.getInstance()

exports.parse = (phone) => {
  const cleaned = phone.replace(/[^\d]/g, '')

  const parsed = PhoneNumberUtil.parse(`+${cleaned}`)
  if (!PhoneNumberUtil.isValidNumber(parsed)) {
    throw new Errors.InvalidPhoneNumberError()
  }

  return { countryCode: parsed.getCountryCode(), nationalNumber: parsed.getNationalNumber() }
}

exports.format = (nationalNumber, countryCode) => {
  let phoneNumber = new PhoneNumber()
  phoneNumber.setNationalNumber(nationalNumber)
  phoneNumber.setCountryCode(countryCode)

  return PhoneNumberUtil.format(phoneNumber, PhoneNumberFormat.E164)
}
