'use strict'

class Profile {
  constructor (opts) {
    this.id = opts.id
    this.tier = opts.tier || 2

    this.records = []
    if (opts.records) {
      if (Array.isArray(opts.records)) {
        this.records = opts.records
      }
    }
  }

  addRecord (record) {
    this.records.push(record)
  }

  toSoap () {
    return { 'ProfileID': this.id, 'Tier': this.tier, 'NAPTR': this.records.map(r => r.toSoap()) }
  }
}

module.exports = Profile
