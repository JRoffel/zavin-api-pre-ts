var mongoose = require('mongoose');

var Stop = new mongoose.Schema({
	plannedBy: {type: String, required: true},
	startDate: {type: Date, required: true},
	endDate: {type: Date, required: true}
});

module.exports = mongoose.model('Stop', Stop);