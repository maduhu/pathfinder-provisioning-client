'use strict'

const Config = require('./config')
const Provisioning = require('../src')

const args = process.argv.slice(2)
if (args.length < 3) {
  console.log('You must enter a phone number, a profile ID and a status to change!')
  process.exit(1)
}

const phone = args[0]
const profileId = args[1]
const status = args[2]

const address = args.length >= 4 ? (args[3] === 'local' ? Config.LOCAL_ADDRESS : Config.CTE_ADDRESS) : Config.CTE_ADDRESS

const client = Provisioning.createClient({ address })

client.changePhoneNumberStatus(phone, profileId, status)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
