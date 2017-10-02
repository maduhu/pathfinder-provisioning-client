'use strict'

const Config = require('./config')
const Provisioning = require('../src')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('You must enter a phone number to deactivate!')
  process.exit(1)
}

const phone = args[0]

const address = args.length >= 2 ? (args[1] === 'local' ? Config.LOCAL_ADDRESS : Config.CTE_ADDRESS) : Config.CTE_ADDRESS

const client = Provisioning.createClient({ address })

client.deactivatePhoneNumber(phone)
  .then(response => {
    console.log('RESPONSE MESSAGE')
    console.dir(response, { depth: null })
  })
  .catch(err => {
    console.log('ERROR')
    console.log(err)
  })
