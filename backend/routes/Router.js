
module.exports = function(server) {

	this.get = request.fill(server, 'get');
	this.post = request.fill(server, 'post');
	this.put = request.fill(server, 'put');
	this.del = request.fill(server, 'del');
	this.serverError = serverError;

	///////////////////

	var baseApi = '/api';

	var sessionService = require('../services/sessionService');
	var Session = require('../models/session');

	function createRoutePath(endPoint) {
	    if(endPoint) {
	        return baseApi + endPoint;
	    } else {
	        return baseApi;
	    }
	};

	// opts: {open: true} if no authentication required
	//		 {login: true} if passport.authenticate('local') middleware should be called
	// cb: function(req, res, Session)
	// TODO: Should we allow next() to be called? Requires us to name routes.
	function request(server, method, url, cb, opts) {
		opts = opts || {};

		var endpoint = createRoutePath(url);

		var fn = function(req, res) {
			console.log('Got request to: ', [method, endpoint]);
			var sess = new Session(sessionService.currentSession(req));
			return cb(req, res, sess);
		};

		var middleware = [];

		if (opts.login) {
			// This route authenticates the user
			middleware.push(sessionService.authenticateUserMW());
		} else if (!opts.open) {
			// This route requires the user to already be authenticated
			middleware.push(sessionService.requireAuthMW());
		}
		// TODO: Add authorization here based on roles passed to opts

		var args = [endpoint, middleware, fn].flatten();
		console.log('Creating route: ', [method, endpoint, opts]);
		return server[method].apply(server, args);
		
	};

	// Usage service.something().then(...).catch(serverError(res));
	function serverError(res) {
		return function(err) {
			console.log('error: ', err);
			res.send(500);
		};
	};

};
