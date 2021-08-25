var config = require('../config/config');
var jwt = require('jsonwebtoken');

exports.get_authserver_url = function(cb) {
    cb(config.auth_api_host)
};

exports.get_apiserver_url = function(cb) {
    cb(config.api_host)
};

exports.get_api_key = function(cb) {
    cb(config.api_key)
};

exports.getToken = function(req) {
    if (req.headers) {
        if ('authorization' in req.headers || 'Bearer' in req.headers) {
            //return 'invalid';
            return req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            return req.cookies.token;
        } else {
            return req.session.token;
        }
    } else {
        return '';
    }

}

exports.decodeToken = function(token, cb) {
    //here we are NOT using verify, as the key keeps changing, so we only decode, but this is a security hole,and backend NEEDS to verify it
    cb(null, jwt.decode(token));
}

exports.encodeToken = function(json, cb) {
    jwt.sign(json, config.jwt_secret, cb);
}


exports.getUserInfoFromToken = function(tokenObj) {
    let userObj = jwt.decode((tokenObj));
    return {
        role: userObj && userObj['role'] ? userObj['role'] : '',
        name: userObj && userObj['name'] ? userObj['name'] : '',
        company: userObj && userObj['company'] ? userObj['company'] : ''
    }
}
