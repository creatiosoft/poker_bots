/*
* @Author: Sushil Jain
* @Date:   2017-04-25 16:10:55
* @Last Modified by:   sushiljainam
* @Last Modified time: 2017-06-27 15:14:01
*/

'use strict';
var _ = require('underscore');

var botPath = '../'; // maintain this in every file acc to file's position; ends with slash; work like undot
var routes = require(botPath+'config/gameRoutes');
var bcast = routes.bcast;
// var globals = require(botPath+'config/globals');

// var Xs = globals.botState;


var Listener = {};

Listener[bcast.sit] = function (data) { 
	//https://docs.google.com/document/d/1x8huCndzJcU0rmIYyvlmyV-L9snkW6hKqs46bJ2xFOw/edit
	//{"channelId":"5926da973b21fd46bb836ef1","playerId":"592979d68195c947cb8bd147","chips":20000,"seatIndex":1,"playerName":"A3q8W.bot","imageAvtar":"https://fbcdn.net/v/60F","giftImageId":"","state":"WAITING","route":"sit"}
	var bot = this;
	console.log('--broadcast--', bcast.sit, data, bot.isSardar, bot.inRoom)
	if(/*!bot.isSardar&&*/bot.inRoom){
		if(bot.get('myTable').channelId=== data.channelId){
			// update table
			bot.get('myTable').updatePlayers(data);
			if(bot.get('playerId')=== data.playerId){
				if(!bot.onTable){
					bot.gotASeat();
				} else{
					// I am already on table, or kha bethu? andar ghus jau kya.. :) 
				}
			} else {
				// somebody else got a seat
				bot.elseGotSeat instanceof Function && bot.elseGotSeat();
			}
		}
	}
};
Listener[bcast.tablePlayers] = function (data) { 
	// we should always call this function by binding 'bot' Object
	// {"channelId":"5926da973b21fd46bb836ef1","players":[{"playerId":"592979cd8195c947cb8bd145","chips":20000,"state":"WAITING","moves":[]}],"removed":[],"route":"tablePlayers"}
	var bot = this;
	console.log('--broadcast--', bcast.tablePlayers, data, bot.isSardar, bot.inRoom)
	if(/*!bot.isSardar&&*/bot.inRoom){
		if(bot.get('myTable').channelId=== data.channelId){
			// update table
			bot.get('myTable').updatePlayers(data.players, data.removed);
			if(bot.onTable){ // TODO : check data.removed
				var t = _.findWhere(data.players, {playerId: bot.get('playerId')});
				if(t){
					if(t.state=== "PLAYING"){
						bot.gotToPlay(true);
					} else {
						bot.gotToPlay(false);
					}
				} else {
					// check if I am no more sitting on table
					// if i am stand up hit leave, and hit logout
				}
			} else {
				// somebody else got a seat
				console.log('tablePlayers - I am in room, and not in table players. means i m an observer');
			}
		}
	} else {
		console.log('RARE tablePlayers rejected becoz of bot state being- ',bot.get('state'));
	}
};
Listener[bcast.myCards] = function (data) { };
Listener[bcast.stakes] = function (data) { };
Listener[bcast.start] = function (data) { 
	// we should always call this function by binding 'bot' Object
	// {"channelId":"5926da973b21fd46bb836ef1","roundId":"5fd0935c-2a45-41d5-9cfa-40d33303f158","dealerIndex":1,"smallBlindIndex":1,"bigBlindIndex":9,"currentMoveIndex":1,"moves":[6,2,4],"smallBlind":1000,"bigBlind":2000,"pot":[],"roundMaxBet":2000,"state":"RUNNING","roundName":"Preflop","minRaiseAmount":4000,"maxRaiseAmount":20000,"totalPot":3000,"route":"start"}
	var bot = this;
	console.log('--broadcast--', bcast.start, data, bot.isSardar, bot.inRoom);
	if(/*!bot.isSardar&&*/bot.inRoom){
		if(bot.get('myTable').channelId=== data.channelId){
			// update table
			// bot.get('myTable').update(data); // TODO-immi
			if(bot.inGame){
				// check for "whose next turn"?
				if(bot.mySeatIndex=== data.currentMoveIndex){
					console.log('turn is mine.')
					bot.hitSimpleMove(_.pick(data, 'channelId', 'moves'));
				} else {
					// some body else has next turn
					console.log('turn is not mine.')
				}
			}
		}
	} else {
		console.log('RARE tablePlayers rejected becoz of bot state being- ',bot.get('state'));
	}
};
Listener[bcast.myPreCheck] = function (data) { };
Listener[bcast.playerTurn] = function (data) { 
	//https://docs.google.com/document/d/1x8huCndzJcU0rmIYyvlmyV-L9snkW6hKqs46bJ2xFOw/edit
	//{"success":true,"channelId":"5926da973b21fd46bb836ef1","playerId":"592979d68195c947cb8bd147","playerName":"A3q8W.bot","amount":0,"action":"FOLD","chips":19000,"isRoundOver":true,"roundName":"Showdown","pot":[3000],"toJackpot":0,"currentMoveIndex":"","moves":[],"totalRoundBet":0,"roundMaxBet":0,"lastRoundMaxBet":2000,"minRaiseAmount":0,"maxRaiseAmount":0,"totalPot":3000,"route":"playerTurn"}
	var bot = this;
	console.log('--broadcast--', bcast.playerTurn, data, bot.isSardar, bot.inRoom);
	if(/*!bot.isSardar&&*/bot.inRoom){
		if(bot.get('myTable').channelId=== data.channelId){
			// update table
			// bot.get('myTable').update(data); // TODO-immi
			if(bot.inGame){
				// check for "whose next turn"?
				if(bot.mySeatIndex=== data.currentMoveIndex){
					console.log('turn is mine.')
					bot.hitSimpleMove(_.pick(data, 'channelId', 'moves'));
				} else {
					// some body else has next turn
					console.log('turn is not mine.')
				}
			}
		}
	} else {
		console.log('RARE tablePlayers rejected becoz of bot state being- ',bot.get('state'));
	}
};
Listener[bcast.roundEnd] = function (data) { };
Listener[bcast.leave] = function (data) { 
	// if i am stand up hit leave, and hit logout
};
Listener[bcast.gameEnd] = function (data) { };
Listener[bcast.bankrupt] = function (data) { };

Listener[bcast.tableUpdated] = function (data) {
	// we should always call this function by binding 'bot' Object
	var bot = this;
	console.log('--broadcast--', bcast.tableUpdated, data, bot.isSardar, bot.onLobby/*, data.action=== 'update', data.data.reason=== 'move'*/)
	if (!bot.isSardar) {
		return;
	}
	if (!bot.onLobby) {
		return;
	}
	// if(data.action=== 'update' && (data.data.reason=== 'move'/*||data.data.reason=== 'leave'*/)){
	// 	return;
	// }
	// now we are ready to decide that something has to be done.
	// either players are increased/decreased. (reason: sit/leave)
	// OR a table has been added/deleted. (action: add/remove)
	if(data.event=="TABLEPLAYINGPLAYER"){	
		bot.get('tables').findTableById(data._id).updatePlayersCount(data.updated.playingPlayers);
		bot.applyDecisionsForATAble(bot.get('tables').findTableById(data._id));
	}
};

Listener[bcast.myAntiBanking] = function (data) { };
Listener[bcast.myChips] = function (data) { };

Listener[bcast.connAck] = function (data) {
	var bot = this;
	// data.playerId
	bot.hitAckReply()
}

module.exports = Listener;