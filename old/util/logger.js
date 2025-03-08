"use strict";

const Logger = require("winston");

Logger.remove(Logger.transports.Console);

Logger.add(new Logger.transports.Console, {
    colorize: true,
    handleExceptions: true
});

Logger.level = "debug";

module.exports = Logger;