var mongoose = require('mongoose');

var Exam = mongoose.Schema({
	pdfLocation: {
		type: String,
		required: true
	},
	questions: [String],
	created: Date
});

module.exports = mongoose.model('Exam', Exam);