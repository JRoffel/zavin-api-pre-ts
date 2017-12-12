var mailer = require('nodemailer');
var config = require('./../../config');

var transporter = mailer.createTransport({
	host: "188.203.64.116",
	auth: {
		user: config.mailUser,
		pass: process.env.MAIL_SECRET || config.mailPass
	},
	secure: true
});

module.exports = {
	sendMail: function(user, callback) {
		var mail = "<html>" +
			"<body>" +
			'<p>Er is een nieuw account aangevraagd, klik op de volgende link of kopieer deze naar de adresbalk om het account te verifiëren: <a href="' +
			config.mailLocation + user._id +
			'">' +
			config.mailLocation + user._id +
			'</a></p>'

		+"<ul>" +
		"<li>Bedrijfsnaam: " + user.name + "</li>" +
			"<li>Straat: " + user.adres + "</li>" +
			"<li>Postcode: " + user.postal_code.split('-')[0] + "</li>" +
			"<li>Postbus: " + user.postal_code.split('-')[1] + "</li>" +
			"<li>Stad: " + user.city + "</li>" +
			"<li>Uitvoerend Voorman: " + user.foreman + "</li>" +
			"<li>Naam Contactpersoon: " + user.contactperson.name + "</li>" +
			"<li>E-mailadres Contactpersoon: " + user.contactperson.email + "</li>" +
			"<li>Telefoonnummer Contactpersoon: " + user.contactperson.phone + "</li>" +
			"<li>E-mailadres: " + user.email + "</li>" +
			"</ul>" +
			"</body>" +
			"</html>";

		var error = null;

		require('./../controllers/userController').getAllUsers({
			role: "admin"
		}, null, function(err, users) {
			users.forEach(function(recipient, i, array) {
				var mailOptions = {
					from: "portal@zavin.nl",
					to: recipient.email,
					subject: 'Nieuw account aangevraagd!',
					html: mail
				}

				transporter.sendMail(mailOptions, function(err, data) {
					console.log(err, data);
					if (err) {
						error += err;
					}

					if (i === array.length - 1) {
						if (callback != null && callback != undefined) {
							callback();
						}
					}
				});
			});
		});
	},

	confirmApprove: function(user, callback) {
		var mail = "<html>" +
			"<body>" +
			"<p> Uw account is zojuist geactiveerd door een administrator van de Zavin.</p>" +
			"<p> U kunt nu inloggen op het portaal te vinden op: <a href=\"" +
			config.baseUrlClient +
			"\">" +
			config.baseUrlClient +
			"</a></p><br><br><br>" +
			"<p>Met vriendelijke groet,</p><br>" +
			"<p>Administrator Zavin</p>" +
			"</body>" +
			"</html>";

		var mailOptions = {
			from: '"zavin-contractorportal" <portal@zavin.nl>',
			to: user.email,
			subject: 'Account geactiveerd!',
			html: mail
		}

		transporter.sendMail(mailOptions, function(err, data) {
			if (err) {
				if (callback != null && callback != undefined) {
					callback(null, null);
				}
				return;
			}

			if (callback != null && callback != undefined) {
				callback(null, data);
			}
		});
	},

	sendForgotPassword: function(email, id, callback) {
		var mail = "<html>" +
			"<body>" +
			"<p>U heeft aangegeven dat u uw wachtwoord voor Zavin Contractorportaal bent vergeten</p>" +
			"<p>Indien u dit niet heeft gedaan kunt u deze mail negeren</p>" +
			"<p>Als u dat wel heeft gedaan, druk dan op de volgende link of plak deze in de adresbalk</p>" +
			"<p>klik hier: <a href=\"" +
			config.passwordLocation + id +
			"\">" +
			config.passwordLocation + id +
			"</a></p><br><br><br>" +
			"<p>Met vriendelijke groet,</p><br>" +
			"<p>Zavin Administrator</p>" +
			"<body>" +
			"<html>";

		var mailOptions = {
			from: '"zavin-contractorportal" <portal@zavin.nl>',
			to: email,
			subject: "Wachtwoord vergeten",
			html: mail
		}

		transporter.sendMail(mailOptions, function(err, data) {
			if (err) {
				if (callback != null && callback != undefined) {
					callback(null, null);
				}
				return;
			}

			if (callback != null && callback != undefined) {
				callback(null, data);
			}
		});
	}
}