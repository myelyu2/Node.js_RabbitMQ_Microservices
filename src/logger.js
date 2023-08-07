/**
    * Logger
    * Uses winston to log important events and errors to m1.js and m2.js.
    * This configuration logs messages both to the console (in color simplified format),
    * and to a file called combined.log in JSON format.
 */

const winston = require('winston');

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		winston.format.errors({
			stack: true
		}),
		winston.format.splat(),
		winston.format.json()
	),
	defaultMeta: {
		service: 'user-service'
	},
	transports: [
		// Console logs
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			)
		}),

		// File logs
		new winston.transports.File({
			filename: 'combined.log'
		})
	]
});

module.exports = logger;