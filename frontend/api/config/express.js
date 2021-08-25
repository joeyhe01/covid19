'use strict';

/**
* Module dependencies.
*/

const express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    flash = require('connect-flash'),
    config = require('./config'),
    path = require('path'),
    cors = require('cors'),
    http = require('http'),
    jwt = require('jsonwebtoken'),
    request = require('request'),
    compression = require('compression');

const getUserInfoFromToken = function (token) {
    let userObj = jwt.decode(token);
    //REMOVE BELOW for Mockup Purpose only
    return {
        role: userObj['role'],
        name: userObj['name'],
        company: userObj['company'],
    }
};

module.exports = function () {
    // Initialize express app
    const app = express();
    //gzip all assets
    app.use(compression());

    app.use(cors());

    app.options('*', cors()); // include before other routes

    // Showing stack errors
    app.set('showStackError', true);

    // Setting the app router and static folder
    app.use('/m', express.static(path.resolve('../mobile/build/web'), {
        maxAge: 86400000
    }));
    app.use(express.static(path.resolve('../ui/dist'), {
        maxAge: 86400000
    }));

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '10mb'
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Enable jsonp
    app.enable('jsonp callback');

    // CookieParser should be above session
    app.cookieParser = cookieParser();
    app.use(app.cookieParser);

    // connect flash for flash messages
    app.use(flash());

    // Use helmet to secure Express headers
    //app.use(helmet());

    // Globbing routing files
    config.getGlobbedFiles('./routes/**/*.js').forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });

    app.get('/m/', (req, res) => {
        res.sendFile('index.html', { root: path.resolve('../mobile/build/web/') });
    });


    app.get('/*', (req, res) => {
        res.sendFile('index.html', { root: path.resolve('../ui/dist') });
    });

    return app;
};
