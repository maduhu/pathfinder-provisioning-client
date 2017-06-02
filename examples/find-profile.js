'use strict'

const Provisioning = require('../src')

const client = Provisioning.createClient({ address: 'https://pathfinder-cte-pi.neustar.biz/nrs-pi/services/SIPIX/SendRequest' })

client.findProfile('TestDFSP18')
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
