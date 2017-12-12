require('@risingstack/trace');
var express = require('express');
var app = express();
var router = express.Router();
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var userController = require('./app/controllers/userController');
var tokenController = require('./app/controllers/tokenController');
var errorCodes = require('./app/libs/errorCodes');
var userConfig = require('./client-config');
var mailHelper = require('./app/helpers/mailHelper');
var stopController = require('./app/controllers/stopController');
var examController = require('./app/controllers/examController');
var statusHelper = require('./app/helpers/statusCodeHelper');
var sanitizer = require('./app/helpers/sanitizer');
//var initHelper = require('./app/helpers/initHelper.js')

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ZavinPortal");

app.use(bodyparser.urlencoded({
	extended: true
}));
app.use(bodyparser.json());
app.use(sanitizer);

router.get('/', function(req, res) {
	res.status(statusHelper.getStatusCode('GET', null)).json({
		message: "You have successfully found the Zavin API!"
	});
});

router.route('/user')
	.post(function(req, res) {
		//Ugh
		userController.createUser(req, res);
	})
	.get(function(req, res) {
		userController.getAllUsers(req.query, req.header("authorization"), function(err, user) {
			res.status(statusHelper.getStatusCode('GET', err)).json(err || user);
		});
	})

router.route('/user/:accountId')
	.get(function(req, res) {
		userController.getUser(req.params.accountId, function(err, user) {
			res.status(statusHelper.getStatusCode('GET', err)).json(err || user);
		});
	})

.patch(function(req, res) {
	userController.editUser(req.params.accountId, req.body, function(err, user) {
		res.status(statusHelper.getStatusCode('PATCH', err)).json(err || user);
	});
})

.delete(function(req, res) {
	userController.deleteUser(req.params.accountId, req.header('authorization'), function(err) {
		res.status(statusHelper.getStatusCode('DELETE', err)).json(err || {
			success: true
		});
	});
})

router.route('/approveUser/:accountId')
	.patch(function(req, res) {
		tokenController.validateToken(req.header("authorization"), function(err, token, user) {
			if (err) {
				res.status(statusHelper.getStatusCode('PATCH', err)).json({
					error: errorCodes[10964]
				});
				return;
			}

			if (user.role != 'admin') {
				var error = errorCodes[11012];
				error.additionalData = {
					currentRole: user.role,
					requiredRole: 'admin'
				};
				res.status(statusHelper.getStatusCode('PATCH', error)).json({
					error: error
				});
				return;
			}

			userController.approveUser(req.params.accountId, function(err) {
				res.status(statusHelper.getStatusCode('PATCH', err)).json(err);
			});
		});
	})

router.route('/roles')
	.get(function(req, res) {
		res.status(statusHelper.getStatusCode('GET', null)).json({
			roles: userConfig.roles
		});
	})

.post(function(req, res) {
	//add role logic
	//edit client-config.js
	res.status(404).end();
})

router.route('/token')
	.get(function(req, res) {
		tokenController.validateToken(req.header("authorization"), function(err, token, user) {
			res.status(statusHelper.getStatusCode('GET', err)).json(err || {
				token: token,
				user: user
			});
		})
	})

router.route('/token/:accountId')
	.post(function(req, res) {
		tokenController.getNewToken(req.body.password, req.params.accountId, function(err, token) {
			res.status(statusHelper.getStatusCode('POST', err)).json(err || token);
		});
	})

router.route('/userToken')
	.get(function(req, res) {
		tokenController.validateToken(req.header("authorization"), function(err, token, user) {
			res.status(statusHelper.getStatusCode('GET', err)).json(err || {
				user: userController.mapUser(user)
			});
		})
	})

router.route('/forgotPass/:accountId')
	//Send user an email with link for account resets
	.get(function(req, res) {
		userController.getUser(req.params.accountId, function(err, user) {
			if (err) {
				res.status(statusHelper.getStatusCode('GET', errorCodes[12934])).json(errorCodes[12934]);
				return;
			}

			mailHelper.sendForgotPassword(user.email, user._id, function(err) {});

			res.status(statusHelper.getStatusCode('GET', err)).json(err);
		});
	})
	//Set new password
	.patch(function(req, res) {
		userController.resetPassword(req.params.accountId, req.body.password, function(err) {
			res.status(statusHelper.getStatusCode('GET', err)).json(err);
		});
	})

router.route('/stops')
	.get(function(req, res) {
		res.status(418).end("If I wasn't a teapot, this would return a list of stops");
	})

.post(function(req, res) {
	stopController.createStop(req.body, req.header('authorization'), function(err, stop) {
		res.status(statusHelper.getStatusCode('POST', err)).json(err || stop);
	})
})

router.route('/exams')
	.get(function(req, res) {
		res.status(418).end("If I wasn't a teapot, this would give a full list of all you need for a test");
	})

.post(function(req, res) {
	examController.createExam(req.body, req.header('authorization'), function(err, exam) {
		res.status(statusHelper.getStatusCode('POST', err)).json(err || exam);
	});
})

.patch(function(req, res) {
	res.status(418).end("If I wasn't a teapot, this would allow you to edit parts of a test without invalidating it");
})

//Is this route deprecated?
router.route('/exams/pdf')
	.get(function(req, res) {
		examController.getPdf(req.header("authorization"), function(err, pdfLoc) {
			res.status(statusHelper.getStatusCode('GET', err)).json(err || {
				pdf: pdfLoc
			});
		})
	})

.patch(function(req, res) {
	res.status(418).end("If I wasn't a teapot, this would allow you to change the pdf of the active exam");
})

router.route('/exams/questions')
	.get(function(req, res) {
		res.status(418).end("If I wasn't a teapot, this would get all questions from the database");
	})

.post(function(req, res) {
	res.status(418).end("If I wasn't a teapot, this would register a new question");
})

router.route('/exams/questions/:questionId')
	.get(function(req, res) {
		res.status(418).end("If I wasn't a teapot, this would return the question with matching id");
	})

.patch(function(req, res) {
	res.status(418).end("If I wasn't a teapot, this would edit the question with matching id");
})

.delete(function(req, res) {
	res.status(418).end("If I wasn't a teapot, this would delete the question with given id");
})

app.use('/api', function(req, res, next) {
	if (req.protocol == 'http' && process.env.isHeroku == undefined) {
		res.set('Upgrade', 'TLS/1.0');
		res.status(426).end("Please upgrade to HTTPS");
	} else {
		next();
	}
});

app.use('/api', router);

app.listen(process.env.PORT || process.argv[2] || 8001);

console.log("Server online!");