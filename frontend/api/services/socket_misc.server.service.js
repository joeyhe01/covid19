var apiService = require('./api.server.service');

exports.processingEvents = function(conn, msgObj, cb) {
    switch (msgObj.type) {
        case 'AUTH_SIGNUP_USER':
            postUserSignUp(conn, msgObj, cb);
            break;
        case 'AUTH_USER_LOGIN':
            postUserLogin(conn, msgObj, cb);
            break;
        case 'AUTH_USER_ACTIVATE':
            getActivate(conn, msgObj, cb);
            break;
        case 'AUTH_FORGET_PWD':
            postSendPwdEmail(conn, msgObj, cb);
            break;
        case 'AUTH_CHANGE_PWD':
            postChangePassword(conn, msgObj, cb);
            break;
        case 'AUTH_REFRESH_TOOKEN':
            refreshToken(conn, msgObj, cb);
            break;
        case 'GET_S3_CONFIG':
            getS3Config(conn, msgObj, cb);
            break;

    }
};

let adminDeletePano = function(conn, message, cb) {
    apiService.adminDeletePano(message['token'], message['content']['id'], (err, data) => {
        cb(conn, message, data);
    });
}

let adminGetAllUsers = function(conn, message, cb) {
    apiService.adminGetAllUsers(message['token'], (err, data) => {
        cb(conn, message, data);
    });
}

let adminMerchants = function(conn, message, cb) {
    apiService.adminMerchants(message['token'], (err, data) => {
        cb(conn, message, data);
    });
}

let adminCountPanos = function(conn, message, cb) {
    apiService.adminCountPanos(message['token'], message['content']['searchBody'], (err, data) => {
        cb(conn, message, data);
    });
}

let adminSearchPanos = function(conn, message, cb) {
    apiService.adminSearchPanos(message['token'], message['content']['searchBody'], (err, data) => {
        cb(conn, message, data);
    });
}
let getS3Config = function(conn, message, cb) {
    apiService.getS3UploaderSettings(message['token'], (err, data) => {
        cb(conn, message, data);
    });
}
let postUserLogin = function(conn, message, cb) {
    apiService.postUserLogin(message['content'], (err, data) => {
        cb(conn, message, data);
    });
};
let postUserSignUp = function(conn, message, cb) {
    apiService.postUserSignUp(message['content'], (err, data) => {
        cb(conn, message, data);
    });
};
let getActivate = function(conn, message, cb) {
    apiService.getActivate(message['content']['code'], (err, data) => {
        cb(conn, message, data);
    });
};
let postSendPwdEmail = function(conn, message, cb) {
    apiService.postSendPwdEmail(message['content'], (err, data) => {
        cb(conn, message, data);
    });
};
let postChangePassword = function(conn, message, cb) {
    apiService.postChangePassword(message['content'], (err, data) => {
        cb(conn, message, data);
    });
};
let refreshToken = function(conn, message, cb) {
    apiService.refreshToken(message['token'], (err, data) => {
        cb(conn, message, data);
    });
}
