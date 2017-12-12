var stopModel = require('./../models/stop');
var errorCodes = require('./../libs/errorCodes');
var tokenController = require('./tokenController');

module.exports = {
	createStop: function(body, token, callback) {
		tokenController.validateToken(token, function(err, token, user) {
			if (err) {
				callback(err);
				return;
			}
			if (user.role == 'admin') {
				var stop = new stopModel()

				stop.plannedBy = user._id;
				stop.startDate = (new Date(body.startDate)) || null;
				stop.endDate = (new Date(body.endDate)) || null;

				stop.save(function(err) {
					if (err) {
						callback(err);
						return;
					}

					callback(null, stop);
				});
			} else {
				var error = errorCodes[11012];
				error.additionalData = {
					currentRole: user.role,
					requiredRole: 'admin'
				}
				callback(error);
			}
		});
	}
}