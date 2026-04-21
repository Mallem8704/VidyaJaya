const winston = require('winston');

// Define custom format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  })
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'vidyajaya-api' },
  transports: [
    // Output everything to the console (caught by Render's native logs seamlessly)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // Output to physical files for deep debugging if deployed on VMs/VPS
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// A stream object for Morgan HTTP logging to use Winstron safely
logger.stream = {
  write: function (message) {
    // Trim newline at the end of Morgan strings
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

module.exports = logger;
