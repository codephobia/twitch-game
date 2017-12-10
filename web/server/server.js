'use strict';

var loopback     = require('loopback');
var boot         = require('loopback-boot');
var path         = require('path');
var async        = require('async');
var moduleLoader = require('./lib/module-loader');

var app = module.exports = loopback();

// determine if the server was run via `$ node server.js`
var isMain = (require.main === module);
app.set('isMain', isMain);

async.series([
    function (seriesCb) {
        // root paths for app
		var options = {
			"appRootDir": path.join(__dirname, "configs"),
			"bootDirs": [path.join(__dirname, "boot")],
			"modelSources": [path.join(__dirname, "..", "common", "models")],
			// MIXIN PATHS ARE ALL RELATIVE TO root/server
			"mixinSources": [path.join(__dirname, "mixins"), path.join(__dirname, "..", "common", "mixins")]
		};
        
        // generate boot options with modules included
		moduleLoader.generateBootOptions(app, options, function (err, bootOptions) {
			if (err) {
				return seriesCb(err);
			}
			boot(app, bootOptions, seriesCb);
		});
    }
], function (err) {
    if (err) {
        console.log("[ERROR] Unable to run server: ", err);
        return;
    }
    
    // don't run server if being included
    if (isMain) {
        app.start();
    }
});

// start server
app.start = function () {
	// start the web server
	return app.listen(function () {
		app.emit('started');

		var baseUrl = app.get('url').replace(/\/$/, '');
		var explorer = app.get('loopback-component-explorer');

		if (explorer) {
			var explorerPath = explorer.mountPath;
			console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
		}
	});
};