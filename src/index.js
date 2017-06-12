'use strict'

const Client = require('./client')
const Profile = require('./profile')
const Record = require('./record')
const Errors = require('./errors')

exports.createClient = (opts) => {
  return new Client(opts || {})
}

exports.Profile = (opts) => {
  return new Profile(opts || {})
}

exports.Record = (opts) => {
  return new Record(opts || {})
}

exports.Errors = Errors
