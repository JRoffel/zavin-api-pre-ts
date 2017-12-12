module.exports = {
	getStatusCode: function(method, error) {
		var errorType = null;
		if(error != null && error.errorCode != undefined && error.errorCode != null) {
			errorType = error.errorCode.split('-')[0];
		} else if(error != null) {
			errorType = 'ex';
		}

		var preliminaryCode = _getErrorCode(errorType);

		if(preliminaryCode != null) {
			return preliminaryCode;
		} else {
			return _getMethodCode(method);
		}
	}
}

_getMethodCode = function(method) {
	switch(method) {
		case 'GET':
			return 200;
			break;

		case 'POST':
			return 201;
			break;

		case 'PATCH':
			return 200;
			break;

		case 'DELETE':
			return 204;
			break;

		default:
			return 200;
			break;
	}
}

_getErrorCode = function(errorType) {
	if(errorType == 'ex') {
		return 500;
	}

	switch(errorType) {
		case '00':
			return 401;
			break;

		case '0F':
			return 403;
			break;

		case '5F':
			return 400;
			break;

		case '3D':
			return null;
			break;

		case '3F':
			return 400;
			break;

		case 'FF':
			return null;
			break;

		default:
			return null;
			break;
	}
}