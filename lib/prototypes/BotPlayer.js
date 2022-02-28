var async = require('async');

var botPath = '../../'; // maintain this in every file acc to file's position; ends with slash; work like undot
var utils = require(botPath+'lib/utils');
var Listener = require(botPath+'lib/listeners');
var serverConfig = require(botPath+'config/serverConfig');
var routes = require(botPath+'config/gameRoutes');
var globals = require(botPath+'config/globals');
var Table = require(botPath+'lib/prototypes/Table');

var hits = routes.reqs;
var bcast = routes.bcast;
var Xs = globals.botState;
var verifyRes = utils.verifyRes;

var Bot = require(botPath+'lib/prototypes/Bot');

Bot.prototype.launch = function(params, lCB) {
	var bot = this;

	var params = params || {};
	// console.log('..........',params)
	// var window = utils.getWindowObj();
	//require(botPath+'lib/boot');
	
	var pomelo = utils.getWindowObj();

	var host = serverConfig.gate.host;
	var port = serverConfig.gate.port;

	async.waterfall([
		async.apply(prepare, {pomelo: pomelo, host: host, port: port, bot: bot, input: params}), //apply params
		gateInit,
		hitRegister,
		hitLogin,
		gateDisconnect,
		connectorInit,
		// hitGetUser,
		// hitGetTables,
		// hitAddChips, // optionally
		hitJoinTable,
		addAllListeners, //can be done parallel to hitGetUser
		hitSitTable,
		finish
	],
	function (err, response) {
		if (err) {
			console.error(err);
			// process.send('OFFLINE-logged_out') // do this in logout function
			// SUGGESTION: set timer for disconnect, hit logout,
			// if logout success -> kill timer, hit disconnect
			// if logout fails -> kill timer, hit disconnect (with a MSG if possible)
			pomelo.disconnect();
			return;
		}
		if(lCB instanceof Function) {
			lCB()
		}
	})
	return true;
};

// Bot.prototype.botNeeded = botBrain.botNeeded;

Bot.prototype.hitSimpleMove = function(params) {
	var bot = this;
	// var py = {action: (params.moves.indexOf(1)>=0?'CHECK':'CALL'), amount: 0};
	var py = {action: (params.moves.indexOf(1)>=0?'CHECK':(params.moves.indexOf(2)>=0?'CALL':'FOLD')), amount: 0};
	console.log('444555', params, py)
	setTimeout(function () {
		bot.pomelo.request(hits.move.toString(), bot.getPayload(hits.move, py), function (res) {
		// console.log('444556', res);
			
		})	
	// }, 900);
	}, (Math.floor(Math.random() * 6) + 4) *1000);
};

module.exports = Bot;

function prepare(p, cb){
	cb(null, p);
}

function gateInit(p, cb){
	p.pomelo.init({host: p.host, port: p.port}, function(argument) {
		console.log('connected');
		// update bot state number
		cb(null, p);
		// process.send('soon to hit register, should I skip?');
	})
}

function hitRegister(p, cb){
	// check some condtn, bot state etc.
	p.pomelo.request(hits.register.toString(), p.bot.getPayload(hits.register,{type : "registration"}), function (res) {
		// console.log("this is to inform you----------",res);
		if (verifyRes(res) || res.code==409) { // error code for emailExists
			// update bot state number, as registered
			// p.bot.set('state', Xs.STREET_REGD);
			cb(null, p);
		} else {
			cb({error: "Register failed | Network Error.", by: p.bot.get('email')})
		}
	})
}

function hitLogin(p, cb){
	// check some condtn, bot state etc.
	p.pomelo.request(hits.login.toString(), p.bot.getPayload(hits.login, {type : "login"}), function (res) {
		// console.log("res in login-----------" + res);
		if (verifyRes(res)) {
			// update bot state number, as registered
			// p.bot.set('token', res.data.authToken);
			// p.bot.set('state', Xs.STREET_TOKEN);
				p.bot.set("playerId",res.user.playerId);
				p.bot.set("playerName",res.user.userName);
				p.host = res.user.host; // NOT available, if pin true
				p.port = res.user.port; // NOT available, if pin true
				// p.bot.set('state', Xs.STREET_TOKEN_IP);
				cb(null, p);
		} else {
			cb({error: "Login failed | response is insufficient.", by: p.bot.get('email')})
		}
	});
}

function gateDisconnect(p, cb){
	p.pomelo.disconnect()
	// update states
	cb(null, p);
}

function connectorInit(p, cb){
	p.pomelo.init({host: p.host, port: p.port}, function(argument) {
		console.log('connected');
		// update bot state number
		// check some condtn, bot state etc.
		p.pomelo.request(hits.entry.toString(), p.bot.getPayload(hits.entry), function (res) {
			// console.log(res);
			if (verifyRes(res)) {
				// update bot state number, as 
				if (!!res.data) {
					// player is not on lobby
					// hit leave for bot player
					var channelId = res.data.channelId;
					// TODO: we should decide if he should NOT LEAVE
					p.pomelo.request(hits.leave.toString(), p.bot.getPayload(hits.leave, {channelId: channelId}), function (res) {
						if (verifyRes(res)) {
							// player is on lobby NOW
							p.bot.set('state', Xs.LOBBY);
							cb(null, p); return;
						}else{
							cb({error: "connecter entry-leave failed.", by: p.bot.get('email'), channelId: channelId});
						}
					})
				} else {
					// player is on lobby
					p.bot.set('state', Xs.LOBBY);
					cb(null, p); return;
				}
			} else {
				cb({error: "connecter entry failed.", by: p.bot.get('email')});
			}
		})
	})
}

function hitGetUser(p, cb){
	p.pomelo.request(hits.getUser.toString(), p.bot.getPayload(hits.getUser), function (res) {
		// console.log(res);
		if (verifyRes(res)) {
			p.bot.set('myProfile',res.data);
			p.bot.set('playerId',res.data.playerId);
			cb(null, p);
		} else {
			cb({error: "get user failed.", by: p.bot.get('email')});
		}
	})
}

function hitAddChips(p, cb) {
	if(p.bot.get('myProfile').chips<10000000){
		var py = {chips: 50000000};
		p.pomelo.request(hits.updateProfile.toString(), p.bot.getPayload(hits.updateProfile, py), function (res) {
			if(verifyRes(res)) {
				// chips added succesfully - LOG
			} else {
			}
			cb(null, p); return;
		})
	} else {
		cb(null, p)
	}
}

function hitJoinTable(p, cb){
	// var myTable = p.bot.set('myTable', {}); // new Table
	// myTable.channelId = p.input.table.channelId;
	p.bot.set('toJoinTableId', p.input.table.channelId);
	p.pomelo.request(hits.joinChannel.toString(), p.bot.getPayload(hits.joinChannel), function (res) {
		// console.log(res);
		if (verifyRes(res)) {
			var myTable = p.bot.set('myTable', new Table(Object.assign({}, res.tableDetails, res.roomConfig, {antibanking: res.antibanking}), true));
			console.log('```````', myTable)
			p.bot.set('state', Xs.ROOM);
			cb(null, p);
		} else {
			cb({error: "join table failed. - MAJOR", by: p.bot.get('email'), res: res});
			// p.pomelo.disconnect(); // logout
		}
	})
}

function hitSitTable(p, cb) {
	var chips = p.bot.get('myTable').minSitAmount;
	var isAntiBanking = p.bot.get('myTable').getAntibanking().isAntiBanking;
	p.pomelo.request(hits.sit.toString(), p.bot.getPayload(hits.sit, {chips: chips, isAntiBanking: isAntiBanking}), function (res) {
		// console.log(res);
		if (verifyRes(res)) {
			// there is nothing to do at its positive response
			cb(null, p);
		} else {
			cb({error: "take seat failed. - MAJOR", by: p.bot.get('email'), res: res});
			p.pomelo.disconnect(); // logout
		}
	})
}

function addAllListeners(p, cb){
	p.pomelo.on(bcast.sit.toString(), Listener[bcast.sit].bind(p.bot));
	p.pomelo.on(bcast.tablePlayers.toString(), Listener[bcast.tablePlayers].bind(p.bot));
	p.pomelo.on(bcast.start.toString(), Listener[bcast.start].bind(p.bot));
	p.pomelo.on(bcast.playerTurn.toString(), Listener[bcast.playerTurn].bind(p.bot));
	p.pomelo.on(bcast.connAck.toString(), Listener[bcast.connAck].bind(p.bot));
	// etc. TODO
	cb(null, p);
}

function finish(p, cb){
	// console.log(JSON.stringify(p.bot));
	p.bot.pomelo = p.pomelo;
	cb(null, p);
}