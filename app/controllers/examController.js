var tokenController = require('./tokenController');
var errorCodes = require('./../libs/errorCodes');
var examModel = require('./../models/exam');

module.exports = {
	createExam: function(body, token, callback) {
		tokenController.validateToken(token, function(err, token, user) {
			if (err) {
				callback(err);
				return;
			}

			if (user.role == 'admin') {
				var exam = new examModel();
				exam.pdfLocation = body.pdfLocation;
				exam.questions = body.questions || [];
				exam.created = new Date(Date.now());

				exam.save(function(err) {
					if (err) {
						callback(err);
						return;
					}

					callback(null, exam);
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
	},

	getPdf: function(token, callback) {
		tokenController.validateToken(token, function(err, token, user) {
			if (err) {
				callback(err);
				return;
			}

			examModel.findOne({}, {}, {
				sort: {
					'created': -1
				}
			}, function(err, examObject) {
				if (err) {
					callback(err);
					return;
				}

				if (examObject == undefined || examObject == null || examObject == []) {
					callback(errorCodes[20101]);
					return;
				}

				callback(null, examObject.pdfLocation);
			});
		});
	}
}