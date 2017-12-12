module.exports = function(req, res, next) {
	if (req.body != {} && req.body != null && req.body != undefined) {
		req.body = sanitizeObject(req.body);
	}

	if (req.params != {} && req.body != null && req.body != undefined) {
		req.params = sanitizeObject(req.params);
	}

	if (req.params != 'err' && req.body != 'err') {
		next();
	}
}

function sanitizeObject(sanitizable) {
	try {
		Object.keys(sanitizable).forEach(function(key) {
			if (Array.isArray(sanitizable[key])) {
				sanitizable[key] = sanitizeArray(sanitizable[key]);
			} else if (sanitizable[key] == null) {
				sanitizable[key] = null;
			} else if (typeof sanitizable[key] == 'number') {
				sanitizable[key] = sanitizable[key];
			} else if (typeof sanitizable[key] == 'string') {
				sanitizable[key] = sanitizable[key].replace(/[&\\,$'":\*<>{}]/g, '');
			} else if (typeof sanitizable[key] == 'function') {
				sanitizable[key] = null;
			} else if (typeof sanitizable[key] == 'object') {
				sanitizable[key] = sanitizeObject(sanitizable[key]);
			}
		});
		return sanitizable;
	} catch (ex) {
		console.log(ex);
		res.status(503).json({
			message: "Crash whilst sanitizing object",
			error: ex
		});

		return 'err';
	}
}

function sanitizeArray(array) {
	try {
		array.forEach(function(key) {
			if (Array.isArray(array[key])) {
				array[key] = sanitizeArray(array[key]);
			} else if (sanitizable[key] == null) {
				sanitizable[key] = null;
			} else if (typeof array[key] == 'number') {
				array[key] = array[key];
			} else if (typeof array[key] == 'string') {
				array[key] = array[key].replace(/[&\\,$'":\*<>{}]/g, '');
			} else if (typeof array[key] == 'function') {
				array[key] = null;
			} else if (typeof array[key] == 'object') {
				array[key] = sanitizeObject(array[key]);
			}
		});
		return array;
	} catch (ex) {
		console.log(ex);
		res.status(503).json({
			message: "Crash whilst sanitizing object",
			error: ex
		});
		return err;
	}
}