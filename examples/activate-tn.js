'use strict'

const Config = require('./config')
const Provisioning = require('../src')

const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('You must enter a phone number and profile ID to activate!')
  process.exit(1)
}

const phone = args[0]
const profileId = args[1]

const address = args.length >= 3 ? (args[2] === 'local' ? Config.LOCAL_ADDRESS : Config.CTE_ADDRESS) : Config.CTE_ADDRESS

const client = Provisioning.createClient({ address })

client.activatePhoneNumber(phone, profileId)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
