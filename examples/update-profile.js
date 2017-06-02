'use strict'

const Provisioning = require('../src')

const client = Provisioning.createClient({ address: 'https://pathfinder-cte-pi.neustar.biz/nrs-pi/services/SIPIX/SendRequest' })

let record = Provisioning.Record({ order: 10, preference: 5, service: 'E2U+mm', partnerId: 10305, regexp: { pattern: '^.*$', replace: 'mm:001.504@leveloneproject.org' } })
let record2 = Provisioning.Record({ order: 10, preference: 15, service: 'E2U+mm', partnerId: 10305, regexp: { pattern: '^.*$', replace: 'mm:001.123@leveloneproject.org' } })
let profile = Provisioning.Profile({ id: 'TestDFSP16', records: [record, record2] })

client.updateProfile(profile)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
