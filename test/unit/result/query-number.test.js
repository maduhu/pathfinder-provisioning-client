'use strict'

const src = '../../../src'
const Test = require('tapes')(require('tape'))
const Sinon = require('sinon')
const Phone = require(`${src}/phone`)
const QueryNumberResult = require(`${src}/result/query-number`)

Test('QueryNumberResult', resultTest => {
  let sandbox

  resultTest.beforeEach(t => {
    sandbox = Sinon.sandbox.create()
    sandbox.stub(Phone, 'format')
    t.end()
  })

  resultTest.afterEach(t => {
    sandbox.restore()
    t.end()
  })

  resultTest.test('constructor should', constructorTest => {
    constructorTest.test('handle error with no ResponseData', test => {
      let soapResponse = {
        Envelope: {
          Body: {
            Response: {
              ReturnCode: { '_': '404' },
              TextMessage: [
                { '_': 'Not Found' },
                { '_': 'No TN profile could be found' },
                { '_': 'Date: Tue May 30 18:54:10 GMT 2017' }
              ]
            }
          }
        }
      }

      let queryNumberResult = new QueryNumberResult(soapResponse)
      test.equal(queryNumberResult.code, 404)
      test.deepEqual(queryNumberResult.data, {})
      test.end()
    })

    constructorTest.test('parse single response and set data field as array', test => {
      let customerId = 222
      let countryCode = 1
      let nationalNumber = 5158675309
      let formattedTn = `+${countryCode}${nationalNumber}`
      let dateCreated = '2017-05-25T21:45:57.021Z'
      let status = 'active'
      let profileId = 'TestDFSP'
      let tier = 3

      let soapResponse = {
        Envelope: {
          Body: {
            Response: {
              ReturnCode: { '_': '200' },
              TextMessage: [
                { '_': 'OK' },
                { '_': '1 TN profile is queried successfully' },
                { '_': 'Date: Tue May 30 18:54:10 GMT 2017' }
              ],
              ResponseData: {
                TNData: {
                  TN: {
                    Base: nationalNumber.toString(),
                    CountryCode: countryCode.toString()
                  },
                  Customer: { '$': { id: customerId.toString() } },
                  DateCreated: dateCreated,
                  Status: status,
                  DNSProfileID: profileId,
                  Tier: tier.toString()
                }
              }
            }
          }
        }
      }

      Phone.format.returns(formattedTn)

      let queryNumberResult = new QueryNumberResult(soapResponse)
      test.equal(queryNumberResult.code, 200)
      test.equal(queryNumberResult.data.length, 1)

      let queryNumberData = queryNumberResult.data[0]
      test.equal(queryNumberData.customerId, customerId)
      test.equal(queryNumberData.created, dateCreated)
      test.equal(queryNumberData.profileId, profileId)
      test.equal(queryNumberData.tier, tier)
      test.equal(queryNumberData.status, status)
      test.equal(queryNumberData.tn, formattedTn)
      test.ok(Phone.format.calledWith(nationalNumber, countryCode))
      test.end()
    })

    constructorTest.test('parse multiple TNData and set data field as array', test => {
      let customerId = 222
      let countryCode = 1
      let nationalNumber = 5158675309
      let countryCode2 = 44
      let nationalNumber2 = 3022121211
      let formattedTn = `+${countryCode}${nationalNumber}`
      let formattedTn2 = `+${countryCode2}${nationalNumber2}`
      let dateCreated = '2017-05-25T21:45:57.021Z'
      let status = 'active'
      let profileId = 'TestDFSP'
      let tier = 3

      let soapResponse = {
        Envelope: {
          Body: {
            Response: {
              ReturnCode: { '_': '200' },
              TextMessage: [
                { '_': 'OK' },
                { '_': '2 TN profiles are queried successfully' },
                { '_': 'Date: Tue May 30 18:54:10 GMT 2017' }
              ],
              ResponseData: {
                TNData: [{
                  TN: {
                    Base: nationalNumber.toString(),
                    CountryCode: countryCode.toString()
                  },
                  Customer: { '$': { id: customerId.toString() } },
                  DateCreated: dateCreated,
                  Status: status,
                  DNSProfileID: profileId,
                  Tier: tier.toString()
                },
                {
                  TN: {
                    Base: nationalNumber2.toString(),
                    CountryCode: countryCode2.toString()
                  },
                  Customer: { '$': { id: customerId.toString() } },
                  DateCreated: dateCreated,
                  Status: status,
                  DNSProfileID: profileId,
                  Tier: tier.toString()
                }]
              }
            }
          }
        }
      }

      Phone.format.withArgs(nationalNumber, countryCode).returns(formattedTn)
      Phone.format.withArgs(nationalNumber2, countryCode2).returns(formattedTn2)

      let queryNumberResult = new QueryNumberResult(soapResponse)
      test.equal(queryNumberResult.code, 200)
      test.equal(queryNumberResult.data.length, 2)

      let queryNumberData = queryNumberResult.data[0]
      test.equal(queryNumberData.customerId, customerId)
      test.equal(queryNumberData.created, dateCreated)
      test.equal(queryNumberData.profileId, profileId)
      test.equal(queryNumberData.tier, tier)
      test.equal(queryNumberData.status, status)
      test.equal(queryNumberData.tn, formattedTn)

      let queryNumberData2 = queryNumberResult.data[1]
      test.equal(queryNumberData2.customerId, customerId)
      test.equal(queryNumberData2.created, dateCreated)
      test.equal(queryNumberData2.profileId, profileId)
      test.equal(queryNumberData2.tier, tier)
      test.equal(queryNumberData2.status, status)
      test.equal(queryNumberData2.tn, formattedTn2)

      test.end()
    })

    constructorTest.end()
  })

  resultTest.end()
})
