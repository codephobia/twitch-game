'use strict';

var serveStatic = require("serve-static");
var NODE_ENV = process.env.NODE_ENV;

module.exports = function(server) {
    // load dev paths for client files
    if (NODE_ENV == "development") {
        server.use('/client', serveStatic("client"));
    }
    
    // link extended access token
	//server.use(loopback.token({
	//	model: server.models.ExtendedAccessToken
	//}));
    
    // health-check for load balancer
	server.get("/health-check", function (req, res) {
		res.status(200).send("healthy");
	})
};
