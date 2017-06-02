'use strict'

const Provisioning = require('../src')

const client = Provisioning.createClient({ address: 'https://pathfinder-cte-pi.neustar.biz/nrs-pi/services/SIPIX/SendRequest' })

let record = Provisioning.Record({ order: 10, preference: 1, service: 'E2U+mm', partnerId: 10305, regexp: { pattern: '^.*$', replace: 'mm:001.504@leveloneproject.org' } })
let profile = Provisioning.Profile({ id: 'TestDFSP18', records: [record] })

client.createProfile(profile)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
