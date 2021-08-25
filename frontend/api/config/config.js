'use strict';

const _ = require('lodash'),
    glob = require('glob'),
    log4js = require('log4js');

const env = process.env.NODE_ENV || 'development';

const envVariables = _.extend(
    require('./env/all'),
    require('./env/' + env) || {}
);
module.exports = envVariables;

const path = envVariables.logPath || "../logs";
const fileName = 'api.log';

/** config log4js according to the log settings.*/
log4js.configure({
    appenders: {
        console: {
            type: 'console'
        },
        'api-file': {
            type: 'file',
            filename: path + '/' + fileName,
            maxLogSize: 1024000, //1MB
            backups: 2
        },
        'api': {
            type: 'logLevelFilter',
            appender: 'api-file',
            level: 'debug'
        },
    },
    categories: {
        default: {
            appenders: envVariables.logAppenders || ['console', 'api'],
            level: 'debug'
        }
    }
});

module.exports.getLogger = function (category = 'default') {
    return log4js.getLogger(category);
};


/**
 * Get files by glob patterns
 */
module.exports.getGlobbedFiles = function (globPatterns, removeRoot) {
    // For context switching
    const _this = this;

    // URL paths regex
    const urlRegex = new RegExp('^(?:[a-z]+:)?//', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function (globPattern) {
            output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            var files = glob(globPatterns, { sync: true });
          if (removeRoot) {
              files = files.map(function(file) {
                  return file.replace(removeRoot, '');
              });
          }
          output = _.union(output, files);
        }
    }

    return output;
};
