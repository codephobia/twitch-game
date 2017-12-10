var loopback = require("loopback");
var passport = require("passport");
var async = require("async");
var crypto = require("crypto");

var PassportConfigurator = require("loopback-component-passport").PassportConfigurator;

module.exports = function (server) {
    var passportConfigurator = PassportConfigurator(server);
    var passportProviders = {};

    try {
        passportProviders = require("../configs/providers." + process.env.NODE_ENV + ".js");
    } catch (err) {
        console.error('Please configure your passport strategy in `providers.json`.');
        console.error('Copy `providers.json.template` to `providers.json` and replace the clientID/clientSecret values with your own.');
        process.exit(1);
    }

    passportConfigurator.init();
    passportConfigurator.setupModels({
        userModel: server.models.user,
        userIdentityModel: server.models.userIdentity,
        userCredentialModel: server.models.userIdentity
    });

    for (var s in passportProviders) {
        var c = passportProviders[s];
        c.session = c.session !== false;
        passportConfigurator.configureProvider(s, c);
    }
};

function generateKey(hmacKey, algorithm, encoding) {
    algorithm = algorithm || 'sha1';
    encoding = encoding || 'hex';

    var hmac = crypto.createHmac(algorithm, hmacKey);
    var buf = crypto.randomBytes(32);
    hmac.update(buf);

    var key = hmac.digest(encoding);
    return key;
}