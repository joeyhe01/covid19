"use strict";

var config = require("../config/config");
var async = require("async");
var sidecar = require("./sidecar.server.service");

var http = require('follow-redirects').http,
    https = require('follow-redirects').https,
    _ = require("lodash");

var request = function(options, hostUrl, cb) {

    var haveRequestBody = !_.isUndefined(options.requestBody);
    var requestBody;
    if (haveRequestBody) {
        if (
            typeof options.requestBody === "string" ||
            options.requestBody instanceof String
        ) {
            requestBody = options.requestBody;
        } else {
            requestBody = JSON.stringify(options.requestBody);
        }
    }

    var proto = "http";
    var port = "80";
    var subUrl = "";
    var host = "";

    if (hostUrl.substr(0, 5) === "https") {
        proto = "https";
        subUrl = hostUrl.substr(8);
        port = "443";
    } else {
        subUrl = hostUrl.substr(7);
    }
    if (subUrl.indexOf(":") > 0) {
        host = subUrl.substring(0, subUrl.indexOf(":"));
        port = subUrl.substr(subUrl.indexOf(":") + 1);
        if (port.indexOf("/") > 0)
            port = port.substring(0, port.indexOf("/") - 1);
    } else {
        host = subUrl;
    }

    if (options.methodUrl.substr(0, 1) !== "/") {
        options.methodUrl = "/" + options.methodUrl;
    }

    var option = {
        host: host,
        path: encodeURI(options.methodUrl),
        port: port,
        method: options.method,
        headers: {}
    };

    if (options.token) {
        option.headers["Authorization"] = 'Bearer ' + options.token;
    }else if (options.apiKey) {
        option.headers["X-AUTH-KEY"] = options.apiKey;
    }

    if (options.contentType) {
        option.headers["Content-type"] = options.contentType;
    }

    if (options.accept) {
        option.headers["Accept"] = options.accept;
    }

    var client = http;
    if (proto === "https") {
        _.assign(option, {
            rejectUnauthorized: false,
            requestCert: true,
            agent: false
        });
        client = https;
    }

    config.getLogger(__filename).debug("Option now is:");
    config.getLogger(__filename).debug(option);
    config.getLogger(__filename).debug("data:");
    config.getLogger(__filename).debug(requestBody);

    var req = client.request(option, function(res) {
        var body = [];
        res.on("data", function(data) {
            body.push(data);
        });

        res.on("end", function() {
            var statusCode = res.statusCode;
            body = body.join("");
            if (statusCode != "200" && statusCode != 200) {
                return cb(null, {
                    statusCode: statusCode,
                    error: body
                });
            } else {
                if (option.method === "DELETE" && body.length === 0) {
                    return cb(null);
                }
                if (options.accept === "text/plain") {
                    cb(null, body);
                } else if (options.accept === "application/json") {
                    if (res.statusCode != '200') {
                        cb(res.statusCode);
                    } else {
                        try {
                            var obj = JSON.parse(body);
                            return cb(null, obj);
                        } catch (e) {
                            return cb(Error("Can't parse JSON " + body));
                        }
                    }
                } else {
                    cb(null, body);
                }
            }
        });
    });
    req.setTimeout(options.timeout ? options.timeout * 1000 : 20000);

    req.on("timeout", function(err) {
        config
            .getLogger()
            .error("Error: Timeout occured: " + option.host + option.path);
        config.getLogger(__filename).error(err);
        cb(null, "Error: Timeout occured: " + option.host + option.path);
    });

    req.on("error", function(err) {
        config.getLogger(__filename).error(err);
        cb(err);
    });

    if (haveRequestBody) {
        req.write(requestBody);
    }

    req.end();
};

// used to cache api url, no need to retrieve again and again
var api_url = null;
var api_key = null;
var get_api_url = function(cb) {
    if (api_url == null) {
        sidecar.get_apiserver_url(function(url) {
            api_url = url;
            cb(null, url);
        });
    } else {
        cb(null, api_url);
    }
};
var get_api_key = function(cb) {
    if (api_key == null) {
        sidecar.get_api_key(function(key) {
            api_key = key;
            cb(api_key);
        });
    } else {
        cb(api_key);
    }
};



exports.post = function(methodUrl, token, requestBodyObj, cb) {

    get_api_key(key=>{
        var options = {
            method: "POST",
            methodUrl: methodUrl,
            requestBody: requestBodyObj,
            contentType: "application/json",
            accept: "application/json",
            token: token,
            timeout: 5000,
            apiKey: key
        };
        async.waterfall(
            [async.apply(get_api_url), async.apply(request, options)],
            cb
        );
    });


};

exports.delete = function(methodUrl, token, cb) {
    get_api_key(key=>{
        var options = {
            method: "DELETE",
            methodUrl: methodUrl,
            contentType: 'text/plain',
            //accept: "text/plain",
            token: token,
            timeout: 5000,
            apiKey: key
        };
        async.waterfall(
            [async.apply(get_api_url), async.apply(request, options)],
            cb
        );
    });
};

exports.postRaw = function(methodUrl, token, requestBodyObj, cb) {
    get_api_key(key=>{
        var options = {
            method: 'POST',
            methodUrl: methodUrl,
            requestBody: requestBodyObj,
            contentType: 'text/plain',
            //accept: 'text/plain',
            token: token,
            timeout: 30000,
            apiKey: key
        };
        async.waterfall(
            [async.apply(get_api_url), async.apply(request, options)],
            cb
        );
    });



};

exports.get = function(methodUrl, token, cb) {
    get_api_key(key=>{
        var options = {
            method: "GET",
            methodUrl: methodUrl,
            token: token,
            accept: "application/json",
            timeout: 5000,
            apiKey: key
        };
        async.waterfall(
            [async.apply(get_api_url), async.apply(request, options)],
            cb
        );
    });


};

exports.getRaw = function(methodUrl, token, cb) {
    get_api_key(key=>{
        var options = {
            method: 'GET',
            methodUrl: methodUrl,
            contentType: 'text/plain',
            accept: 'text/plain',
            timeout: 30000,
            token: token,
            apiKey: key
        };

        async.waterfall(
            [async.apply(get_api_url), async.apply(request, options)],
            cb
        );
    });


};

exports.put = function(methodUrl, token, requestBodyObj, cb) {
    get_api_key(key=>{
        var options = {
            method: "PUT",
            methodUrl: methodUrl,
            requestBody: requestBodyObj,
            contentType: "application/json",
            accept: "application/json",
            token: token,
            timeout: 5000,
            apiKey: key
        };
        async.waterfall(
            [async.apply(get_api_url), async.apply(request, options)],
            cb
        );
    });
};
