var gameServers = require("../../game-server/config/servers.json");
var env = (process.args && process.args.env) || 'development';

var serverConfig = {};

serverConfig.gate = {};
serverConfig.gate.host = gameServers[env]["gate"][0]["connectHost"] || gameServers[env]["connector"][0]["connectHost"]; // pick them from a common file // please update this config acc to requirement
serverConfig.gate.port = gameServers[env]["gate"][0]["clientPort"]; // pick them from a common file
serverConfig.gate.protocol = "ws";

module.exports = serverConfig;