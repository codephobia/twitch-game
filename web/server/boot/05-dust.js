var path = require('path');
var dust = require('dustjs-linkedin');
var consolidate = require("consolidate");

var NODE_ENV = process.env.NODE_ENV;
var INDEX_NAME = NODE_ENV + ".index.dust";

module.exports = function (server) {
    server.engine("dust", consolidate.dust);
    server.set("template_engine", "dust");
    server.set("views", path.join(__dirname, "..", "views"));
    server.set("view engine", "dust");

    server.get("*", indexHandler);
};

// load the dust file from server
function indexHandler(req, res, next) {
    var clientConfig = {};

    res.render(INDEX_NAME, clientConfig);
}