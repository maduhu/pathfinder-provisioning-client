'use strict'

const Client = require('./client')

exports.createClient = (opts) => {
  return new Client(opts || {})
}
