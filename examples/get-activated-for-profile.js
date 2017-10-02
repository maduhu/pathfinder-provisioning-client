'use strict'

const Config = require('./config')
const Provisioning = require('../src')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('You must enter a profile ID to get activated phone numbers for!')
  process.exit(1)
}

const profileId = args[0]

const address = args.length >= 2 ? (args[1] === 'local' ? Config.LOCAL_ADDRESS : Config.CTE_ADDRESS) : Config.CTE_ADDRESS

const client = Provisioning.createClient({ address })

client.getActivatedPhoneNumbers(profileId)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
