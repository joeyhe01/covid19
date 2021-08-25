const config = require('./config/config');
const port = config.port;
const app = require('./config/express')();
const helmet = require('helmet')
app.use(helmet.frameguard());

//Start the app by listening on <port>
const localServer = app.listen(port);
const socketServer = require('./services/socket.server.service').getSocketServer();
config.getLogger(__filename).info('web API server started on port ' + port);
socketServer.installHandlers(localServer, {prefix: '/socket'});

process.on('uncaughtException', function (err) {
    config.getLogger(__filename).fatal("gettting final error in uncaughtException");
    config.getLogger(__filename).fatal( err )
});
