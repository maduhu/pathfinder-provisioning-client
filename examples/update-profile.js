'use strict'

const Config = require('./config')
const Provisioning = require('../src')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('You must enter a profile ID to update!')
  process.exit(1)
}

const profileId = args[0]

const address = args.length >= 2 ? (args[1] === 'local' ? Config.LOCAL_ADDRESS : Config.CTE_ADDRESS) : Config.CTE_ADDRESS

const client = Provisioning.createClient({ address })

let record = Provisioning.Record({ order: 10, preference: 5, service: 'E2U+mm', partnerId: 10305, regexp: { pattern: '^.*$', replace: 'mm:001.321@leveloneproject.org' } })
let record2 = Provisioning.Record({ order: 10, preference: 15, service: 'E2U+mm', partnerId: 10305, regexp: { pattern: '^.*$', replace: 'mm:001.123@leveloneproject.org' } })
let profile = Provisioning.Profile({ id: profileId, records: [record, record2] })

client.updateProfile(profile)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
