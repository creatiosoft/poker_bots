/*
* @Author: sushiljainam
* @Date:   2017-05-24 17:50:58
* @Last Modified by:   sushiljainam
* @Last Modified time: 2017-06-02 19:10:32
*/

var _ = require('underscore');

// my table, acually
// where I am (bot) playing/ to play/ played recently game.
// the table I am joined in.

// botSardar also uses this inside TablesList

var botPath = '../../'; // maintain this in every file acc to file's position; ends with slash; work like undot
var utils = require(botPath+'lib/utils');

// for now HOLDEM game only
// later use this file as common, and make separate file for HOLDEM
function Table(data, fromJoin) {
	if(data instanceof Object){
		// console.log(fromJoin&&data,'------------==========');
		this.channelId = data._id || data.channelId;

		this.data = {};
		this.data.channelId = this.channelId;
		this.data.smallBlind = data.smallBlind;
		this.data.bigBlind = data.bigBlind;
		this.data.minPlayer = data.minPlayer || data.minPlayers;
		this.data.maxPlayer = data.maxPlayer || data.maxPlayers;
		this.data.minBuyIn = data.minBuyIn;
		this.data.maxBuyIn = data.maxBuyIn;
		this.data.isFast = data.isFast;
		this.data.isPotTable = data.isPotTable;
		this.data.casinoId = data.casinoId;
		this.data.isProtected = data.isProtected;
		// this.data.isBotAllowed = data.isBot;// if bot are allow on every table
		this.data.turnTime = data.turnTime;
		this.data.variant = data.variant;
		// some keys are ignored
		
		if(fromJoin){
			var thisData = this.data;
			thisData.channelType = data.channelType;
			// thisData.roundId = data.roundId;
			thisData.jackpotChips = data.jackpotChips;
			thisData.state = data.state;
			thisData.roundCount = data.roundCount;
			thisData.roundName = data.roundName;
			thisData.roundBets = data.roundBets;
			thisData.roundMaxBet = data.roundMaxBet;
			// thisData.maxBetAllowed = data.maxBetAllowed;
			thisData.pot = data.pot;
			thisData.boardCard = data.boardCard;
			thisData.dealerIndex = data.dealerIndex;
			thisData.smallBlindIndex = data.smallBlindIndex;
			thisData.bigBlindIndex = data.bigBlindIndex;
			thisData.currentMoveIndex = data.currentMoveIndex;
			thisData.minRaiseAmount = data.minRaiseAmount;
			thisData.maxRaiseAmount = data.maxRaiseAmount;
			thisData.totalPot = data.totalPot;
			// thisData.remainingMoveTime = data.remainingMoveTime;
			// thisData.tableId = data.tableId;
			// thisData.channelName = data.channelName;
			thisData.channelVariation = data.channelVariation;
			thisData.antibanking = data.antibanking;
		}

		this.players = []; 
		this.updatePlayers(data.players || []);

		this.lastUpdateTime = new Date().getTime();

		this.decisions = {};
	}
}
/*
This is normal template, comes in getTables
 {"_id":"59259d0e34032c5e163536ae","name":"TestTable 1","smallBlind":25,"bigBlind":50,"minPlayer":2,
"maxPlayer":9,"minBuyIn":500,"maxBuyIn":10000,"isFast":false,"isPotTable":false,"casinoId":1,"isEmpty":true,
"isFull":false,"playingPlayer":0,"isProtected":false,"isBot":false,"turnTime":20,"gameInfo":"Bla bla",
"gameInterval":10000,"variant":"Texas Hold'em","createdByUserType":"SYSTEM","players":[],"isLocked":false}

This comes in joinChannel -> 
*/

Table.prototype.isProperTable = function() {
	var tableData = this.data;
	if(this.channelId){
		// if(!tableData.isBotAllowed){
		// 	return false;
		// }
		// more checks for other keys and their types
		return true;
	}
	return false;
};

Table.prototype.get = function(store, key) {
	if (key) {
		return this[store][key];
	}
	return this[store];
};

Table.prototype.getData = function(key) {
	return this.get('data', key);
}

Table.prototype.getAntibanking = function() {
	return this.get('data', 'antibanking');
}

Object.defineProperty(Table.prototype, 'isFull', {get: function () {
	return this.players.length === this.getData('maxPlayer');
}})

Object.defineProperty(Table.prototype, 'isEmpty', {get: function () {
	return this.players.length === 0;
}})

Object.defineProperty(Table.prototype, 'minSitAmount', { get: function () {
	var anti = this.getAntibanking();
	if(anti.isAntiBanking){
		return _.max([anti.amount, this.getData('minBuyIn')]);
	} else {
		this.getData('minBuyIn');
	}
}})

Table.prototype.getEmptySeats = function() {
	// returns array of empty seat indices
	var pls = this.players;
	var seats = utils.range(this.getData('maxPlayer'));
	// slice filled seats
	var filledSeats = [];
	filledSeats = _.reduce(pls, function(s, p){s.push(p.seatIndex); return s;}, filledSeats)
	return _.difference(seats, filledSeats);
};

Table.prototype.getEmptySeat = function() {
	// returns one random empty seat index
	var s = this.getEmptySeats();
	console.log('Table.prototype.getEmptySeat', s, s[Math.floor(Math.random()*s.length)])
	return s[Math.floor(Math.random()*s.length)];
};

Table.prototype.setDecisions = function(decisionParams) {
	this.decisions = decisionParams;
	return true;
};

Table.prototype.getDecisions = function() {
	return this.decisions;
};

Table.prototype.updatePlayersCount = function(c) {
	this.players.length = c;
};

Table.prototype.updatePlayers = function(arr) {
	var pls = this.players;
	/* BIG LESSON:
	 * Do not try !(arr instanceof Array) without braces
	 * Do not try !(variable instanceof AnyFunction) without braces
	 */
	if (arr instanceof Object && !(arr instanceof Array)) {
		arr = [arr];
	}
	if (arr instanceof Array) {
		for (var i = 0; i < arr.length; i++) {
			var arri = _.omit(arr[i], 'channelId', 'imageAvtar', 'giftImageId', 'route'/*, 'playerName'*/);
			var flag = false;
			for (var j = 0; j < pls.length; j++) {
				if(arri.playerId === pls[j].playerId){
					Object.assign(pls[j], arri);
					flag = true;
					break;
				}
			}
			if(!flag){
				pls.push(arri);
			}
		}
	}
	// console.log('55544', this.players, pls)
};

module.exports = Table;