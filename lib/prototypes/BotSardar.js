var async     = require('async');
var mongo     = require('../../../shared/mongodbConnection');
var db        = require("../../../shared/model/dbQuery.js");
var schedule  = require('node-schedule');
// console.log("the db instance-----------------------",db);
// 
//---------------------- db and scheuler -----------------

/**
 * this is to initiate mongo conection
 * 
 * @method init
 */
mongo.init(function(err, response) {
	if(response && response.success) {
		console.log("response of mongo connection",response);
	} else {
		console.log("Error in mongo connection");
	}
});

/**
 * anonymouse funtion for starting schedular to update bot chips every one hour
 */
// (function(){
// 	schedule.scheduleJob('*/0 */0 */1 * * *', function(){
// 		  console.log('Time to give some chips to bots........',new Date());
// 		    upDateBotChips();
// 		});
// })();

/**
 * update bot chips for game
 * 
 * @method upDateBotChips
 */
function upDateBotChips(){
	console.log("in update chips for bot----------");
	db.upDateBotChips(function(err,result) {
		if(err){
			throw err.stack();
		}else{
			console.log("done-------------upDateBotChips");
		}
	});
}

var botPath = '../../'; // maintain this in every file acc to file's position; ends with slash; work like undot
var utils = require(botPath+'lib/utils');
var Listener = require(botPath+'lib/listeners');
var serverConfig = require(botPath+'config/serverConfig');
var routes = require(botPath+'config/gameRoutes');
var globals = require(botPath+'config/globals');

var TablesList = require(botPath+'lib/prototypes/TablesList');

var hits = routes.reqs;
var bcast = routes.bcast;
var Xs = globals.botState;
var Xtm = globals.tableDecisionModes;
var verifyRes = utils.verifyRes;

var Bot = require(botPath+'lib/prototypes/Bot');

Bot.prototype.launch = function(params, lCB) {
	var bot = this;
	bot.set('launchParams', params);

	var params = params || {};
	// console.log('..........',params)
	// var window = utils.getWindowObj();
	// require(botPath+'lib/boot');
	
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
		hitGetBots,
		hitGetTables,
		addAllListeners, //can be done parallel to hitGetUser
		finish
	],
	function (err, response) {
		if (err) {
			console.error(err);
			// SUGGESTION: set timer for disconnect, hit logout,
			// if logout success -> kill timer, hit disconnect
			// if logout fails -> kill timer, hit disconnect (with a MSG if possible)
			pomelo.disconnect();
			return;
		}
		if(lCB instanceof Function) {
			lCB(response);
		}
	})
	return true;
};

Bot.prototype.applyDecisions = function() {
	var bot = this;
	var tablesList = bot.get('tables');
	for (var i = 0; i < tablesList.length; i++) {
		var tbl = tablesList.tables[i];
		setTimeout( function (tbl){
			bot.applyDecisionsForATAble(tbl)
		}, 7*i, tbl);
	}
};

Bot.prototype.applyDecisionsForATAble = function(table) {
	var bot = this;
	var decisions = table.get('decisions');
	if(decisions.mode===true && decisions.SEAT>0){
		if(table.players.length<decisions.SEAT){
			bot.putABot(table);
		}
	}
	if(decisions.mode===true && decisions.SEAT===0){	
		if(/*mode=== Xtm.FULL && */!table.isFull){
			// get a FREE bot OR create, pass table id, decisions, -> launchChild
			bot.putABot(table);
		}
	}
};

Bot.prototype.putABot = function(table) {
	var bot = this;
	// console.log("bot------------",bot);
	var bPls = bot.get('fellaBots');
	// console.log("fellaBots--------------------"+bPls);
	var selBot;
	var c=0,selInd=[];
	var len = len || 5;
	for (var i = 1/*becoz upkaran*/; i < bPls.length; i++) {
		if(bPls[i].isFree==undefined || !!bPls[i].isFree){
			if (c >= len) {break;}
			c++;selInd.push(i);
			break;
		}
	}
	var j = selInd[Math.floor(Math.random()*selInd.length)];
	selBot = ((j>=0) && bPls[j]); // Assign the found one
	if(!selBot){
		// create a new bot
		selBot = bot.createNewBot(); // Assign the created one
	}
	// console.log(selBot, 'ggggggggg');
	selBot.isFree = false;
	setTimeout(launchChild.bind(bot, selBot, 'botPlayer.js', JSON.stringify({name: selBot.name||selBot.userName, channelId: table.channelId||table._id, decisions: table.get('decisions')})), Math.floor(Math.random()*500+20));
};

Bot.prototype.createNewBot = function() {
	var bot = this;
	var name = utils.randomString(10)/*+ '.bot'*/;
	var b = {name: name}
	bot.get('fellaBots').push(b);
	return b;
};

Bot.prototype.setFree = function(refChild) {
	var bot = this;
	refChild.isFree = true;
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
	})
}

function hitRegister(p, cb){
	// check some condtn, bot state etc.
	p.pomelo.request(hits.register.toString(), p.bot.getPayload(hits.register,{type : "registration"}), function (res) {
		console.log("this is to inform you----------",res);
		if (verifyRes(res) || res.code==409) { // error code for emailExists
			// update bot state number, as registered
			p.bot.set('state', Xs.STREET_REGD);
			cb(null, p);
		} else {
			cb({error: "Register failed | Network Error.", by: p.bot.get('email')})
		}
	})
}

function hitLogin(p, cb){
	// check some condtn, bot state etc.
	p.pomelo.request(hits.login.toString(), p.bot.getPayload(hits.login, {type : "login"}), function (res) {
		console.log("res in login-----------" + res);
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
					// hit leave for bot sardar
					var channelId = res.data.channelId;
					p.pomelo.request(hits.leave.toString(), p.bot.getPayload(hits.leave, {channelId: channelId, isStandUp: false}), function (res) {
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

function hitGetBots(p, cb){
	// console.error("(((((((((((((((((((((((((((())))))))))))))))))))0---------------");
	db.getBots(function(err,result) {
		if(err){
			cb(err, p);
			throw err.stack();
		}else{
			console.error("(((((((((((((((((((((((((((())))))))))))))))))))0---------------",result);
			if(result.length > 0){
		  	p.bot.set('fellaBots',result);
		  }
		  else{
		  	p.bot.set('fellaBots',[]);	
		  }
			cb(null, p);
		}
	});
}

function hitGetTables(p, cb){
	p.pomelo.request(hits.getTables.toString(), p.bot.getPayload(hits.getTables), function (res) {
		// console.log(res);
		if (verifyRes(res)) {
			// res.data is array of tables
			var tablesList = p.bot.set('tables', new TablesList(res.result));
			if(tablesList.length>= 1){
				// CAUTION: tablesList is not an Array.
				tablesList.setDecisions(p.input);
				p.bot.applyDecisions();
			}
			cb(null, p); return;
		} else {
			cb({error: "get tables failed. - MAJOR", by: p.bot.get('email')})
		}
	})
}

function addAllListeners(p, cb){
	p.pomelo.on(bcast.tableUpdated.toString(), Listener[bcast.tableUpdated].bind(p.bot));
	p.pomelo.on(bcast.connAck.toString(), Listener[bcast.connAck].bind(p.bot));
	cb(null, p);
}

function finish(p, cb){
	// console.log(JSON.stringify(p.bot));
	p.bot.pomelo = p.pomelo;
	cb(null, p);
}

const cp = require('child_process');

function launchChild (refChild, file, args) {
	// it is a local function; BUT bind to bot
	var bot = this;
	// const spawn = cp.spawn;
	const fork = cp.fork;
	var index = refChild._id || refChild.playerId || refChild.email || refChild.name;
	// refChild['cp'] = spawn('node', [file, args]);
	refChild['cp'] = fork(file, [ args]);
	// console.log('data 0000 from botChild --- ', index, refChild['cp']);

	refChild['cp']./*stdout.*/on('message', (message) => {
	  console.log('data 11 from botChild --- ', index);
	  console.log(`stdout: ${message}`);
	  if (message.indexOf('OFFLINE')>=0) {
	  	// set bot as free, and reuse its profile
	  	bot.setFree(refChild);
	  	// YET TO THINK: deviceId same or different
	  }
	});

	// refChild['cp'].stderr.on('data', (data) => {
	//   console.log('data 22 from botChild --- ', index);
	//   console.log(`stderr: ${data}`);
	// });

	refChild['cp'].on('close', (code) => {
	  // console.log('data 33 from botChild --- ', index);
	  // console.log(`child process exited with code ${code}`);
	  bot.setFree(refChild);
	});
}

