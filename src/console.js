const logLevel = require('./config.json').logLevel; // log:1 info:2 warn:3 error:4

module.exports = {
  log: (...str) => {
    if (logLevel > 1) return;
    console.log(...str);
  },
  info: (...str) => {
    if (logLevel > 2) return;
    console.info(...str);
  },
  warn: (...str) => {
    if (logLevel > 3) return;
    console.warn(...str);
  },
  error: (...str) => {
    if (logLevel > 4) return;
    console.error('[Error]', ...str);
  }
};
