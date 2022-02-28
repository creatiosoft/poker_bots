'use strict';

var reqs = {};
reqs.add = function (key, value, extraKeys) {
	this[key] = { name: value};
	this[key].toString = function () {
		return this.name; };
	return this;
}

var bcast = {};
bcast.add = function (key, value, extraKeys) {
	this[key] = { name: value};
	this[key].toString = function () {
		return this.name; };
	return this;
}


reqs.
add('register','gate.gateHandler.getConnector').
add('login','gate.gateHandler.getConnector').
// add('login','gate.gateHandler.login').
// add('fbLogin','gate.gateHandler.fbLogin').
add('entry','connector.entryHandler.enter').
// add('getUser','connector.entryHandler.getUser').
add('getTables','connector.entryHandler.getLobbyTablesForBot').
add('joinChannel','room.channelHandler.joinChannel').
add('sit','room.channelHandler.sitHere').
add('move','room.channelHandler.makeMove').
add('leave','room.channelHandler.leave');
// add('playNow','room.channelHandler.playNow').
// add('buyInWhileSitting','connector.entryHandler.buyInWhileSitting');
// requests required for game play - ends

reqs.
add('updateProfile','connector.entryHandler.updateUser').
add('ackReply','connector.entryHandler.acknowledgeIsConnected');

reqs.
add('getBots', 'connector.botHelper.getBots');
//extra dedicated APIs

bcast.
add('sit','sit').
add('tablePlayers','gamePlayers').// add('tablePlayers','tablePlayers').
add('myCards','playerCards').//add('myCards','myCards').
add('stakes','stakes').
add('start','startGame').//add('start','start').
add('myPreCheck','preCheck').// add('myPreCheck','myPreCheck').
add('playerTurn','turn').// add('playerTurn','playerTurn').
add('roundEnd','roundOver').//add('roundEnd','roundEnd').
add('leave','leave').
add('gameEnd','gameOver').//add('gameEnd','gameEnd').
add('bankrupt','bankrupt').
add('tableUpdated','tableUpdate').
// add('myAntiBanking','myAntiBanking').
add('myChips','playerCoins');//add('myChips','myChips');
// broadcasts required for game play - ends

bcast.add('connAck','isConnectedOnLogin');

module.exports.reqs = reqs;
module.exports.bcast = bcast;

