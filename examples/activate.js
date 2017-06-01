'use strict'

const Provisioning = require('../src')

const client = Provisioning.createClient({ address: 'https://pathfinder-cte-pi.neustar.biz/nrs-pi/services/SIPIX/SendRequest' })

const phone = '+15158675309'

client.activatePhoneNumber(phone, 'TestDFSP15')
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
