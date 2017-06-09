'use strict'

const Provisioning = require('../src')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('You must enter a profile ID to create!')
  process.exit(1)
}

const profileId = args[0]

const client = Provisioning.createClient({ address: 'https://pathfinder-cte-pi.neustar.biz/nrs-pi/services/SIPIX/SendRequest' })

let record = Provisioning.Record({ order: 10, preference: 1, service: 'E2U+mm', partnerId: 10305, regexp: { pattern: '^.*$', replace: 'mm:001.504@leveloneproject.org' } })
let profile = Provisioning.Profile({ id: profileId, records: [record] })

client.createProfile(profile)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
