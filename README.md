# pathfinder-provisioning-client

A library used to provision PathFinder profiles and associate them to a telephone number.

## Installation
You must have setup connection to the @leveloneproject npm repo on JFrog in order to install.
> npm install @leveloneproject/pathfinder-provisioning-client

## Usage
```
const Provisioning = require('../src')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('You must enter a profile ID to create!')
  process.exit(1)
}

const profileId = args[0]

const client = Provisioning.createClient({ address: 'https://pathfinder-cte-pi.neustar.biz/nrs-pi/services/SIPIX/SendRequest' })

let record = Provisioning.Record({ order: 10, preference: 1, service: 'E2U+mm', regexp: { pattern: '^.*$', replace: 'mm:001.001@leveloneproject.org' } })

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
 ```

## API

### Class: Client

This class represents a client to provision profiles in PathFinder.

#### createClient(options)

- `options` {Object}
  - `address` {String} The URI of the PathFinder provisioning server. Required value, no default provided.
  - `operation` {String} The SOAP operation for the message sent to PathFinder. Defaults to 'Request'.
  - `namespace` {String} The SOAP namespace for the message sent to PathFinder. Defaults to 'http://www.neustar.biz/sip_ix/prov'.
  
Creates a new provisioning client.

#### client.createProfile(profile)

Creates a profile in PathFinder. The profileId of the new profile must not match an existing profileId in PathFinder.

- `profile` {Profile} The profile to create.

Returns a Promise that resolves with a [`BaseResult`](#class-baseresult) object.

This method can also reject the returned Promise with a variety of `Error` types. See [PathFinder Errors](#pathfinder-errors) section for documented error types.

The Promise can also be rejected with validation errors:

- `NoProfileRecordsError` Thrown if the `profile` parameter does not contain any records.

#### client.updateProfile(profile)

Updates an existing profile in PathFinder. This method uses the profileId of the updated profile to match the existing profile in PathFinder.

- `profile` {Profile} The profile to update.

Returns a Promise that resolves with a [`BaseResult`](#class-baseresult) object.

This method can also reject the returned Promise with a variety of `Error` types. See [PathFinder Errors](#pathfinder-errors) section for documented error types returned from PathFinder.

The Promise can also be rejected with validation errors:

- `NoProfileRecordsError` Thrown if the `profile` parameter does not contain any records.

#### client.findProfile(profileId)

Finds a profile matching the provided profile ID.

- `profileId` {String} The profileId of the profile you wish to find in PathFinder.

Returns a Promises that resolves with a [`QueryProfileResult`](#class-queryprofileresult) object.

This method can also reject the returned Promise with a variety of `Error` types. See [PathFinder Errors](#pathfinder-errors) section for documented error types returned from PathFinder.

#### client.activatePhoneNumber(phone, profileId)

Associates a phone number with a profile in PathFinder. This will cause the profile's records to be returned when the phone number is queried in PathFinder. A phone number can only be associated with one profile at any given time.

- `phone` {String} The [E.164](https://en.wikipedia.org/wiki/E.164) formatted phone number to act upon. The + sign at the beginning of the number is optional.
- `profileId` {String} The profileId of the profile you wish to associate with the phone number in PathFinder.

Returns a Promises that resolves with a [`BaseResult`](#class-baseresult) object.

This method can also reject the returned Promise with a variety of `Error` types. See [PathFinder Errors](#pathfinder-errors) section for documented error types returned from PathFinder. 

The Promise can also be rejected with validation errors:

- `InvalidPhoneNumberError` Thrown if the `phone` parameter is not a valid E164 formatted phone number.

#### client.deactivatePhoneNumber(phone)

Removes the association of a phone number with a profile in PathFinder. This will cause the profile's records to no longer be returned when the phone number is queried in PathFinder. A phone number can only be associated with one profile, so there is no need to specify the profileId with this method.

- `phone` {String} The [E.164](https://en.wikipedia.org/wiki/E.164) formatted phone number to act upon. The + sign at the beginning of the number is optional.

Returns a Promises that resolves with a [`BaseResult`](#class-baseresult) object.

This method can also reject the returned Promise with a variety of `Error` types. See [PathFinder Errors](#pathfinder-errors) section for documented error types returned from PathFinder. 

The Promise can also be rejected with validation errors:

- `InvalidPhoneNumberError` Thrown if the `phone` parameter is not a valid E164 formatted phone number.

#### client.getProfileForPhoneNumber(phone)

Gets the associated profileId and other information for a phone number stored in PathFinder.

- `phone` {String} The [E.164](https://en.wikipedia.org/wiki/E.164) formatted phone number to act upon. The + sign at the beginning of the number is optional.

Returns a Promises that resolves with a [`QueryNumberResult`](#class-querynumberresult) object. The data property will contain a single `QueryNumberData` record.

This method can also reject the returned Promise with a variety of `Error` types. See [PathFinder Errors](#pathfinder-errors) section for documented error types returned from PathFinder. 

The Promise can also be rejected with validation errors:

- `InvalidPhoneNumberError` Thrown if the `phone` parameter is not a valid E164 formatted phone number.

#### client.getActivatedPhoneNumbers(profileId)

Gets all of the associated phone numbers for a given profileId in PathFinder. It will only return phone numbers that are currently associated and have not been deactivated.

- `profileId` {String} The profileId you want to get associated phone numbers for.

Returns a Promises that resolves with a [`QueryNumberResult`](#class-querynumberresult) object. The data property will contain an array of `QueryNumberData` records.

This method can also reject the returned Promise with a variety of `Error` types. See [PathFinder Errors](#pathfinder-errors) section for documented error types returned from PathFinder. 

### Class: Profile

This class represents a profile object in PathFinder.

#### Profile(options)

- `options` {Object}
  - `id` {String} The id of the profile. Required value, no default provided.
  - `tier` {Number} The tier level of the profile. Defaults to 2.
  - `records` {Array} An array of `Record` objects for the profile. Does not need to be provided, can also be added through `addRecord` method.
  
Creates a new profile object that can be passed to `Client.createProfile` or `Client.updateProfile`.

#### profile.id

The id of the profile.

#### profile.tier

The tier level of the profile.

#### profile.records

An array of `Record` objects for the profile.

#### profile.addRecord(record)

Adds a [`Record`](#class-record) object to the profile. The profile will need to be sent to PathFinder using the `Client.createProfile` or `Client.updateProfile` for the new record to be visible in PathFinder.

- `record` {Record}

No return value.

#### profile.clearRecords()

Clears all record objects for the profile. The profile will need to be sent to PathFinder using the `Client.createProfile` or `Client.updateProfile` for the records to be removed in PathFinder.

### Class: Record

This class represents a record object for a profile in PathFinder.

#### Record(options)

- `options` {Object}
  - `order` {Number} Specifies the order in which records must be processed when multiple records are returned for the same TN. Number can range from 0 to 65535. Lower values have priority. Required value, no default provided.
  - `preference` {Number} Specifies which record to use when multiple records show the same value for order. Lower values have priority. Required value, no default provided.
  - `service` {String} A character string that specifies the resolution protocol and resolution service(s) that will be available if the rewrite specified by the regexp fields is applied. Required value, no default provided.
  - `regexp` {Object} Required value, no default provided.
    - `pattern` {String} Character string containing the rewrite rule. It is applied to the original query string to construct the domain name.
    - `replace` {String} The replacement string to use when applying the pattern to the E.164 phone number.
  - `ttl` {Number} Time interval in seconds that the record may be stored or cached. Defaults to 900.
  - `domain` {String} The domain that the record is valid for. Defaults to 'e164enum.net'.
  - `replacement` {String} Specifies the next domain name (fully qualified) to query for depending on the potential values found in the flags field. Defaults to '.'.
  - `partnerId` {Number} The numeric id of the partner that the record belongs to. Defaults to -1 (ALL).
  - `flags` {String} Control aspects of the rewriting and interpretation of the fields in the record. Flags are single characters from the set A-Z and 0-9. Defaults to 'U'.

  
Creates a new record object that can be added to a profile using the `Profile.addRecord` method.

#### record.order

The order of the record.

#### record.preference

The preference of the record.

#### record.service

The service value of the record.

#### record.regexp

The regexp value of the record.

#### record.ttl

The time to live value of the record.

#### record.domain

The domain value of the record.

#### record.replacement

The replacement value of the record.

#### record.partnerId

The partner id value of the record.

#### record.flags

The flags of the record.

### Class: BaseResult

This class represents the base result object that is returned by PathFinder.

#### baseResult.code

A numeric code indicating the result of the call to PathFinder.

| Code | Short Name | Description |
| ---- | ---------- | ----------- |
| 200 | OK | Successfully completed. |
| 201 | Created | Successfully created. |
| 202 | Accepted | Received and passed basic validation but not processed yet. |
| 400 | Bad Request | Malformed syntax. The client should not repeat the request without modifications. |
| 401 | Unauthorized | Client lacks privileges to execute the requested operation. |
| 403 | Forbidden | Reserved for future use. |
| 404 | Not Found | The request is valid but the associated records (such as Profiles or TNs) in the request could not be found. |
| 420 | Invalid Value | An attribute value is incorrect syntactically or violates data management policies. |
| 421 | Value Missing | The client did not provide a required attribute value. |
| 500 | Internal Server Error | The server is unable to execute the requested operation due to an internal server error that is not related to the protocol. The failure can be transient. |
| 501 | Not Implemented | The request may be valid but was not implemented by the server. |
| 503 | Service Unavailable | The server is currently unable to handle the request due to a temporary overload or maintenance on the server. The failure can be transient. |
| 505 | Version Not Supported | The request contains elements specifying a protocol version not implemented by the server. |

#### baseResult.messages

An array of string messages that are returned from the PathFinder servers.

#### baseResult.data

An empty object since no data is returned.

### Class: QueryProfileResult

Extends [`BaseResult`](#class-baseresult) class.

#### queryProfileResult.code

Same as [`BaseResult`](#class-baseresult) code property.

#### queryProfileResult.messages

Same as [`BaseResult`](#class-baseresult) messages property.

#### queryProfileResult.data

A [`QueryProfileData`](#class-queryprofiledata) object.

### Class: QueryNumberResult

Extends [`BaseResult`](#class-baseresult) class.

#### queryNumberResult.code

Same as [`BaseResult`](#class-baseresult) code property.

#### queryNumberResult.messages

Same as [`BaseResult`](#class-baseresult) messages property.

#### queryNumberResult.data

Either a single [`QueryNumberData`](#class-querynumberdata) object, or an array of [`QueryNumberData`](#class-querynumberdata) objects. See the [`Client`](#class-client) documentation for instances when the different types are returned.

### Class: QueryProfileData

This class represents the data returned for a profile query.

#### queryProfileData.customerId

The numeric id of the customer that the profile belongs to.

#### queryProfileData.created

An ISO-8601 timestamp indicating when the profile was created.

#### queryProfileData.isInUse

A boolean value indicating whether there are any phone numbers activated and associated with the profile.

#### queryProfileData.profile

A [`Profile`](#class-profile) object containing the profile information.

### Class: QueryNumberData

This class represents the data returned for a phone number query.

#### queryNumberData.customerId

The numeric id of the customer that the profile associated with the phone number belongs to.

#### queryNumberData.created

An ISO-8601 timestamp indicating when the phone number was associated with the profile.

#### queryNumberData.status

A string indicating the status of the phone number. Valid values are 'active' or 'inactive'.

#### queryNumberData.tn

A E164 formatted string of the phone number.

#### queryNumberData.profileId

A string value of the profile ID associated with the phone number.

#### queryNumberData.tier

A numeric value of the tier for the profile associated with the phone number.

## PathFinder Errors

- `BadRequestError` Thrown if a 400 code is returned from PathFinder in SOAP response. 400 code means 'Malformed syntax. The client should not repeat the request without modifications.'.
- `UnauthorizedError` Thrown if a 401 code is returned from PathFinder in SOAP response. 401 code means 'Client lacks privileges to execute the requested operation.'.
- `NotFoundError` Thrown if a 404 code is returned from PathFinder in SOAP response. 404 code means 'The request is valid but the associated records (such as Profiles or TNs) in the request could not be found.'.
- `InvalidValueError` Thrown if a 420 code is returned from PathFinder in SOAP response. 420 code means 'An attribute value is incorrect syntactically or violates data management policies.'.
- `ValueMissingError` Thrown if a 421 code is returned from PathFinder in SOAP response. 421 code means 'The client did not provide a required attribute value.'.
- `ServerError` Thrown if a 500 code is returned from PathFinder in SOAP response. 500 code means 'The server is unable to execute the requested operation due to an internal server error that is not related to the protocol. The failure can be transient.'.
- `ServiceUnavailableError` Thrown if a 503 code is returned from PathFinder in SOAP response. 503 code means 'The server is currently unable to handle the request due to a temporary overload or maintenance on the server. The failure can be transient.'.
- `UnhandledCodeError` Thrown if the code returned from PathFinder SOAP response is not recognized by this client.
- `HttpStatusError` Thrown if the HTTP code returned from the PathFinder SOAP call is not 200.
