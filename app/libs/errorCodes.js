/* PREFIXES:
	00: Authentication errors
	F0: Authorization errors
	5F: HTTP (headers and such) errors
	3D: Account errors
	3F: Validation errors
	FF: Misc. errors
*/

module.exports = {
	407: {
		errorCode: '5F-407',
		message: "Header was not in correct format"
	},

	1401: {
		errorCode: '00-1401',
		message: 'Error, given password does not match password on record'
	},

	1402: {
		errorCode: '3F-1402',
		message: 'Given email is already in use, cannot register user'
	},

	1403: {
		errorCode: '3D-1403',
		message: 'Account has yet to be confirmed'
	},

	1406: {
		errorCode: '3F-1406',
		message: 'Maximum password length is 72 characters'
	},

	1702:  {
		errorCode: '3F-1702',
		message: 'Too many filters applied, please limit the amount of filters to 1'
	},

	1704: {
		errorCode: 'FF-1704',
		message: 'No user matches given filter'
	},

	1705: {
		errorCode: '3F-1705',
		message: 'Filter not allowed'
	},

	1706: {
		errorCode: '3F-1706',
		message: 'No paths to edit have been submitted'
	},

	1707: {
		errorCode: '3F-1707',
		message: 'No valid paths to edit have been entered, please verify that you are not trying to change ID, or an undefined path'
	},

	1709: {
		errorCode: '3F-1709',
		message: 'accountId cannot be null or undefined'
	},

	2405: {
		errorCode: '0F-2405',
		message: 'JWT could not be verified, either is has expired, or it has been incorrectly modified, please login again'
	},

	10964: {
		errorCode: '0F-10964',
		message: 'Given token is not valid'
	},

	10982: {
		errorCode: '0F-10982',
		message: 'No userID matching this token has been found, token will be invalidated'
	},

	10983: {
		errorCode: '0F-10983',
		message: 'No user matches given token'
	},

	11010: {
		errorCode: '0F-11010',
		message: 'User not logged in'
	},

	11012: {
		errorCode: '0F-11012',
		message: 'Given user does not have sufficient permissions, please check additional data'
	},

	12934: {
		errorCode: '3D-12934',
		message: 'Cannot call forgot password on non-existant user'
	},

	20101: {
		errorCode: 'FF-20101',
		message: 'Cannot get active pdf, because no pdf is active!'
	}
}