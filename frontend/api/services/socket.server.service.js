var sockjs = require('sockjs');
var config = require('../config/config');

var socketMisc = require('./socket_misc.server.service');

exports.getSocketServer = function () {

    var sockjs_opts = {
        sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
        disable_cors: false
    };
    var sockjs_server = sockjs.createServer(sockjs_opts);
    var _this = this;

    sockjs_server.on('connection', function(conn) {
        conn.on('data', function(message) {
            config.getLogger(__filename).info("Socket get request message as below:");
            conn['status'] = 'open';
            var msgObj = JSON.parse(message);
            config.getLogger(__filename).info(msgObj);

            //let's restore type to actual ones
            const type_prefix = msgObj['type'].split('___')[0];
            const actual_type = msgObj['type'].split('___')[1];
            msgObj['type'] = actual_type;
            msgObj['type_prefix'] = type_prefix;

            socketMisc.processingEvents(conn, msgObj, _sendBack);
        });

        conn.on('close', function() {
            config.getLogger(__filename).info("Socket closed");
            conn['status'] = 'closed';
        });
    });

    var _sendBack = function (conn, message, data) {
        if (conn['status'] === 'open') {
            var msg = {
                type: message['type_prefix'] +'___'+ message.type,
                content: data
            };
            conn.write(JSON.stringify(msg));
        }
    }

    return sockjs_server;
}
