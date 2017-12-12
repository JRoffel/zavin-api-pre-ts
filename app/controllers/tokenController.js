var bcrypt = require('bcrypt');
var JWT = require('jsonwebtoken');
var errorCodes = require('./../libs/errorCodes');

module.exports =  {
	getNewToken: function(clearPass, accountId, callback) {
		if(accountId == undefined || accountId == null) {
			callback(errorCodes[1709]);
		}

		require('./userController').getUser(accountId, function(err, user) {
			if(user == null || user == undefined || user == 'undefined') {
				callback(errorCodes[1704]);
				return;
			}

			if(user.isApproved == false) {
				callback(errorCodes[1403]);
				return;
			}

			bcrypt.compare(clearPass, user.password, function(err, res) {
				if(res == true) {
					JWT.sign({
						id: user._id
					}, process.env.TOKEN_SECRET || "dev", { expiresIn: "1y" }, function(err, token) {
						if(err) { callback(err); return; }

						callback(null, token);
					});
				} else {
					callback(errorCodes[1401]);
				}
			});
		});
	},

	validateToken: function(token, callback) {
		if(typeof(token) != 'string') {
			callback(errorCodes[407]);
			return;
		}

		JWT.verify(token, process.env.TOKEN_SECRET || "dev", function(err, payload) {
			if(err) { console.error(err); callback(errorCodes[2405]); return; }

			require('./userController').getAllUsers({_id: payload.id}, null, function(err, user) {
				if(err) {callback(errorCodes[10982]); return; }
				user = user[0];

				if(user == null) {
					callback(errorCodes[10983]);
					return;
				}

				JWT.sign({	
					id: user._id
				}, process.env.TOKEN_SECRET || "dev", {expiresIn: '1y'}, function(err, token) {
					if(err) { callback(err); return; }

					callback(null, token, user);
				});
			})
		});
	}
}