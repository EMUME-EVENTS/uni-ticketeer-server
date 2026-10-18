const winston = require('winston');

const customformat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info)=>{
        return `${info.timestamp} - [${info.level}] - ${info.message}`;
    })
);

const logger = winston.createLogger({
    level: 'info',
    format: customformat,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ level: 'error', filename: 'error-logs.log' })
    ]
});

module.exports = logger;