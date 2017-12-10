'use strict';

var path = require("path");
var fs = require("fs");
var async = require("async");
var _ = require("underscore");

function generateBootOptions(app, options, finalCb) {

	// Read the internally defined mixin locations from model-config.
	var baseModelConfig = JSON.parse(fs.readFileSync(path.join(options.appRootDir, 'model-config.json'), 'utf8'));
	var baseMixinPaths = baseModelConfig._meta.mixins;

	// Initialize the boot options
	var loopbackBootOptions = options;

	loopbackBootOptions.bootDirs = loopbackBootOptions.bootDirs || [];
	loopbackBootOptions.modelSources = loopbackBootOptions.modelSources || [];
	loopbackBootOptions.mixinSources = loopbackBootOptions.mixinSources || [];

	// Be sure to include the internally defined mixin locations
	_.each(baseMixinPaths, function(p){
		loopbackBootOptions.mixinSources.push(path.join(options.appRootDir, p));
	});

	// Get the root app directory
	var appDir = path.join(__dirname, "..");

	// Get module dirs
	async.waterfall([

		// check for modules folder
		function (seriesCb) {
			var modulePath = path.join(appDir, "..", "modules");
			var fd = fs.openSync(modulePath, 'r');
			var stats = fs.fstatSync(fd);

			if (!stats.isDirectory()) {
				return seriesCb(true);
			}

			return seriesCb(undefined, modulePath);
		},
		// Iterate over modules folder
		function (modulesPath, seriesCb) {
			return crawlModulesDir(modulesPath, seriesCb);
		}
	],
		function (err) {
			if (err && err !== true) {
				return finalCb(err);
			}

			return finalCb(undefined, loopbackBootOptions);
		});

	function crawlModulesDir(modulesPath, modulesCb) {
		var files = fs.readdirSync(modulesPath);

		return async.eachSeries(files, function (file, eachCb) {
			var newPath = path.join(modulesPath, file);
			var stats = fs.statSync(newPath);

			if (!stats.isDirectory()) {
				return eachCb();
			}

			var mixinPath = path.join("..", "modules", file);
			return crawlModuleDir(newPath, mixinPath, eachCb);
		}, modulesCb);
	}

	function crawlModuleDir(modulePath, mixinPath, moduleCb) {
		var files = fs.readdirSync(modulePath);
		return async.eachSeries(files, function (file, eachCb) {
			var newPath = path.join(modulePath, file);
			var stats = fs.statSync(newPath);

			if (!stats.isDirectory()) {
				return eachCb();
			}

			var newMixinPath = path.join(mixinPath, file);

			// Handlers
			if (file === "server") {
				return serverHandler(newPath, newMixinPath, eachCb);
			} else if (file === "common") {
				return commonHandler(newPath, eachCb);
			}

			return eachCb();
		}, moduleCb);
	}

	function serverHandler(serverPath, mixinPath, serverCb) {
		var files = fs.readdirSync(serverPath);
		return async.eachSeries(files, function (file, eachCb) {
			var newPath = path.join(serverPath, file);
			var stats = fs.statSync(newPath);

			if (!stats.isDirectory()) {
				return eachCb();
			}

			// Handlers
			if (file === "boot") {
				loopbackBootOptions.bootDirs.push(newPath);
			} else if (file === "mixins") {
				var newMixinPath = path.join(mixinPath, file);
				return mixinsHandler(newPath, newMixinPath, eachCb);
			}

			return eachCb();
		}, serverCb);
	}

	function mixinsHandler(bootPath, mixinPath, finalCb) {
		var files = fs.readdirSync(bootPath);
		return async.eachSeries(files, function (file, eachCb) {
			var newPath = path.join(bootPath, file);
			var stats = fs.statSync(newPath);

			if (!stats.isDirectory()) {
				return eachCb();
			}

			var newMixinPath = path.join(mixinPath, file);
			loopbackBootOptions.mixinSources.push(newMixinPath);

			return eachCb();
		}, finalCb);
	}

	function commonHandler(commonPath, commonCb) {
		var files = fs.readdirSync(commonPath);
		return async.eachSeries(files, function (file, eachCb) {
			var newPath = path.join(commonPath, file);
			var stats = fs.statSync(newPath);

			if (!stats.isDirectory()) {
				return eachCb();
			}

			// Handlers
			if (file === "models") {
				return modelHandler(newPath, eachCb);
			}

			return eachCb();
		}, commonCb);
	}

	function modelHandler(modelSourcePath, finalCb) {
		loopbackBootOptions.modelSources.push(modelSourcePath);
		return finalCb();
	}
}

module.exports = {
	generateBootOptions: generateBootOptions
};