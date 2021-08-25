module.exports = function(){
	process.env.NODE_ENV= ( process.env.NODE_ENV || "development").toLowerCase(),

	require.extensions['.server.controller.js'] = require.extensions['.js'];
	require.extensions['.server.model.js'] = require.extensions['.js'];
	require.extensions['.server.route.js'] = require.extensions['.js'];
	require.extensions['.server.service.js'] = require.extensions['.js'];
}
