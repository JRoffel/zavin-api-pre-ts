var mongoose = require('mongoose');

var User = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	adres: String,
	postal_code: String,
	city: String,
	contactperson: {
		name: String,
		email: String,
		phone: String
	},
	foreman: String,
	isApproved: {
		type: Boolean,
		required: true
	},
	role: {
		type: String,
		required: true,
		enum: ["admin", "contractor", "employee"]
	},
	bsn: Number,
	identity: String,
	initials: String,
	birthDate: Date,
	sex: {
		type: String,
		enum: ["m", "f", "o"],
		required: true
	},
	nationality: String,
	vca: Number,
	vcaDocument: String,
	idExpires: Date,
	contractorId: String,
	isDeleted: {
		type: Boolean,
		required: true
	},
	readSafety: Boolean
});

module.exports = mongoose.model('User', User);