var userModel = require('./../models/user');
var bcrypt = require('bcrypt');
var mailHelper = require('./../helpers/mailHelper');
var config = require('./../../config');
var errorCodes = require('./../libs/errorCodes');
var tokenController = require('./tokenController');

module.exports = {
	createUser: function(req, res) {
		var error;
		var user = new userModel();
		user.name = req.body.name;
		user.email = req.body.email;
		user.adres = req.body.adres || null;
		user.postal_code = req.body.postal_code || null;
		user.city = req.body.city || null;
		user.contactperson = req.body.contactperson || null;
		user.foreman = req.body.foreman || null;
		user.isApproved = (req.body.role != "contractor");
		user.role = req.body.role;
		user.bsn = req.body.bsn || null;
		user.identity = req.body.identity || null;
		user.initials = req.body.initials || null;
		user.birthDate = new Date(req.body.birthDate || Date.now());
		user.sex = req.body.sex || 'o';
		user.nationality = req.body.nationality || null;
		user.vca = req.body.vca || null;
		user.vcaDocument = req.body.vcaDocument || null;
		user.idExpires = new Date(req.body.idExpires || Date.now());
		user.isDeleted = false;
		user.readSafety = false;

		tokenController.validateToken(req.header("authorization"), function(err, token, loggedUser) {
			//TODO: Remove dev key before live!
			if (req.header("authorization") != "A123B321Jas$FRDT34Lmngitpa5$mdoor012$kkogo$10$devapp") {
				if (user.name == undefined || user.name == null || user.role == undefined || user.role == null || user.email == undefined || user.email == null || req.body.password == undefined || req.body.password == null) {
					res.status(400).json({
						error: "None of these fields can be null or undefined",
						fields: {
							name: user.name || null,
							role: user.role || null,
							email: user.email || null,
							password: req.body.password || null
						}
					});
					return;
				}

				if (err && user.role != "contractor") {
					res.status(403).json(errorCodes[11010]);
					return;
				}

				if (user.role == "employee" && loggedUser.role != "contractor") {
					error = errorCodes[11012];
					error.additionalData = {
						currentRole: loggedUser.role,
						requiredRole: "contractor"
					};
					res.status(403).json(error);
					return;
				}

				if (user.role == "admin" && loggedUser.role != "admin") {
					error = errorCodes[11012];
					error.additionalData = {
						currentRole: loggedUser.role,
						requiredRole: "admin"
					};
					res.status(403).json(error);
					return;
				}

				if (user.role == "employee") {
					user.contractorId = loggedUser._id;
				} else {
					user.contractorId = null;
				}

				if (req.body.password.length > 72) {
					res.status(400).json(errorCodes[1406]);
					return;
				}
			}

			require("./userController.js").getAllUsers({
				email: user.email
			}, null, function(err, retrievedUser) {
				if (err) {
					if (err.errorCode != 'FF-1704') {
						res.status(500).json({
							"error": err
						});
					} else {
						bcrypt.genSalt(10, function(err, salt) {
							if (err) {
								res.status(500).send(err);
								return;
							}

							bcrypt.hash(req.body.password, salt, function(err, crypted) {
								if (err) {
									res.status(500).send("Error generating encrypted pass: " + err);
									return;
								}

								user.password = crypted;

								user.save(function(err) {
									if (err) {
										res.status(500).send(err);
										return;
									}

									if (user.isApproved == false) {
										mailHelper.sendMail(user)
									}
									res.status(201).json({
										id: user._id,
										email: user.email,
										name: user.name,
										adres: user.adres,
										postal_code: user.postal_code,
										city: user.city,
										contactperson: user.contactperson,
										foreman: user.foreman,
										isApproved: user.isApproved,
										role: user.role,
										initials: user.initials,
										birthDate: user.birthDate,
										sex: user.sex,
										bsn: user.bsn,
										identity: user.identity,
										nationality: user.nationality,
										vca: user.vca,
										vcaDocument: user.vcaDocument,
										idExpires: user.idExpires,
										contractorId: user.contractorId,
										readSafety: user.readSafety
									});
								});
							});
						});
					}
				} else if (retrievedUser != null) {
					res.status(400).send(errorCodes[1402]);
				}
			});
		});
	},

	getUser: function(id, callback) {
		userModel.findById(id, {
			isDeleted: false
		}, function(err, user) {
			if (err) {
				callback(err);
				return;
			}

			callback(null, user);
		})
	},

	approveUser: function(id, callback) {
		userModel.findById(id, function(err, user) {
			if (err) {
				callback(err);
				return;
			}

			user.isApproved = true;

			user.save(function(err) {
				if (err) {
					callback(err);
				}

				mailHelper.confirmApprove(user, function(err, data) {})

				callback(null);
			})
		})
	},

	getAllUsers: function(filter, token, callback) {
		if (Object.keys(filter).length == 1) {
			filter.isDeleted = false;
			if (filter['password'] != undefined || filter['password'] != null) {
				callback(errorCodes[1705]);
				return;
			}
			userModel.find(filter, 'email _id contactperson adres postal_code city foreman role isApproved name initials bsn vca vcaDocument identity idExpires contractorId birthDate sex nationality readSafety', function(err, user) {
				if (err) {
					callback(err);
					return;
				}

				if (user != null && user.length != 0) {
					callback(null, user);
				} else {
					callback(errorCodes[1704]);
				}
			});
		} else if (Object.keys(filter.length == 0)) {
			tokenController.validateToken(token, function(err, newToken, currentUser) {
				if (err) {
					callback(err);
					return;
				}
				if (currentUser.role == "admin") {
					userModel.find({
						"isDeleted": false
					}, function(err, users) {
						if (err) {
							callback(err);
							return;
						}

						callback(null, users);
					});
				} else {
					var error = errorCodes[11012];
					error.additionalData = {
						currenRole: currentUser.role,
						requiredRole: 'admin',
						additionalMessage: 'Only admins are allowed to get all users!'
					};
					callback(error);
				}
			});
		} else {
			callback(errorCodes[1702]);
		}
	},

	editUser: function(id, body, callback) {
		if (Object.keys(body).length == 0) {
			callback(errorCodes[1706]);
			return;
		}

		this.getUser(id, function(err, user) {
			if (err) {
				callback(err);
				return;
			}

			console.log(user);

			for (var key in body) {
				if (key != 'password' && key != '_id') {
					console.log(key);
					user[key] = body[key];
				} else {
					console.log("unknown key: " + key);
					callback(errorCodes[1707]);
					return;
				}
			}

			user.save(function(err) {
				if (err) {
					callback(err);
					return;
				}

				callback(null, {
					success: true
				});
			})
		});
	},

	mapUser: function(user) {
		var obj = {
			id: user._id,
			name: user.name,
			email: user.email,
			adres: user.adres || '',
			postal_code: user.postal_code || '',
			city: user.city || '',
			contactperson: user.contactperson || '',
			foreman: user.foreman || '',
			isApproved: user.isApproved,
			role: user.role,
			initials: user.initials,
			birthDate: user.birthDate,
			sex: user.sex,
			bsn: user.bsn,
			identity: user.identity,
			nationality: user.nationality,
			vca: user.vca,
			vcaDocument: user.vcaDocument,
			idExpires: user.idExpires,
			contractorId: user.contractorId,
			readSafety: user.readSafety
		}

		return obj;
	},

	resetPassword: function(userId, newPass, callback) {
		this.getUser(userId, function(err, user) {
			if (err) {
				callback(err);
				return;
			}

			bcrypt.genSalt(10, function(err, salt) {
				if (err) {
					callback(err);
					return;
				}

				bcrypt.hash(newPass, salt, function(err, hash) {
					if (err) {
						callback(err);
						return;
					}

					user.password = hash;

					user.save(function(err) {
						if (err) {
							callback(err);
							return;
						}

						callback();
					});
				});
			});
		});
	},

	deleteUser(id, token, callback) {
		userModel.findById(id, {
			isDeleted: false
		}, function(err, user) {
			if (err) {
				callback(err);
				return;
			}
			tokenController.validateToken(token, function(err, newToken, executingUser) {
				if (err) {
					callback(err);
					return;
				}
				if (executingUser.role == "admin" || (executingUser.role == "contractor" && executingUser._id == user.contractorId)) {
					// user.isDeleted = true;

					// userModel.save(user, function(err) {
					// 	if(err) {
					// 		callback(err);
					// 		return;
					// 	}
					// 	callback(null);
					// });
					userModel.findByIdAndUpdate(id, {
						$set: {
							isDeleted: true
						}
					}, {
						new: true
					}, function(err, user) {
						if (err) {
							callback(err);
							return;
						}
						callback(null);
					});
				} else {
					error = errorCodes[11012];
					error.additionalData = {
						currentRole: executingUser.role,
						requiredRole: ['admin', 'contractor w/ matching contractorId']
					}
					callback(error);
				}
			});
		});
	}
}