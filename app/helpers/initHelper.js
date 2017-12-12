//This module is yet to reach a working state, continue work in spare time!

var config = require('./../../config.js');

console.log("initHandler");

var customConsole=(function(oldConsole) {
	return {
		log: function(text, onlyLogWhen) {
			if(onlyLogWhen == null) {
				onlyLogWhen = 'dev';
			}

			if(onlyLogWhen.toLowerCase() == config.debugLevel.toLowerCase() || onlyLogWhen.toLowerCase() == 'prod') {
				oldConsole.log(text);
			}
		},

		info: function(text, onlyLogWhen) {
			if(onlyLogWhen == null) {
				onlyLogWhen = 'dev';
			}

			if(onlyLogWhen.toLowerCase() == config.debugLevel.toLowerCase() || onlyLogWhen.toLowerCase() == 'prod') {
				oldConsole.info(text);
			}
		},

		warn: function(text, onlyLogWhen) {
			if(onlyLogWhen == null) {
				onlyLogWhen = 'dev';
			}

			if(onlyLogWhen.toLowerCase() == config.debugLevel.toLowerCase() || onlyLogWhen.toLowerCase() == 'prod') {
				oldConsole.warn(text);
			}
		},

		error: function(text, onlyLogWhen) {
			oldConsole.error(text);
		}
	};
}(console));

console = customConsole;

module.exports = {}