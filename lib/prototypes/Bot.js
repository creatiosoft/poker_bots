var botPath = '../../'; // maintain this in every file acc to file's position; ends with slash; work like undot
var utils = require(botPath+'lib/utils');
var routes = require(botPath+'config/gameRoutes');
var globals = require(botPath+'config/globals');

var hits = routes.reqs;
var Xs = globals.botState;
var Xt = globals.botType;

var defaultMailDomain = '@goldpokerweb.co';
var defaultPassword = '123456789';
var defaultImageAvtar = 'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/15400398_114045245752429_8397771573142168931_n.jpg?oh=47c1432bec85c51eed5115e918844a09&oe=5991460F';

function Bot(data) {
	if (!data) {
		console.warn("Please, provide args.")
		return false;
	}

	if(!data.botType){
		console.warn("Please, provide bot type.")
		return false;
	}
	if(!data.name || !data.email){
		console.warn("Please, provide name & email.")
		return false;
	}

	this.name = data.name;
	this.botType = data.botType;
	var profile = this.profile = {};
	profile.userName = data.name;
	profile.email = data.email || data.name+defaultMailDomain;
	profile.password = data.password || defaultPassword;
	profile.mobileNumber = data.mobileNumber || utils.randomNumber(10);

	profile.nature = data.botSmartness || 10;

	this.settings = {};
	setDefaults(this);
	return this;
}

Bot.prototype.get = function(key, value) {
	if(this.settings[key]===undefined){
		this.set(key, value);
	}
	return this.settings[key];
};

Bot.prototype.set = function(key, value) {
	this.settings[key] = value;
	return this.settings[key];
};

Bot.prototype.unset = function(key) {
	delete this.settings[key];
	return true;
};

Bot.prototype.unsetAll = function() {
	this.settings = {};
	return true;
};

Object.defineProperty(Bot.prototype, 'isSardar', { get: function() {
	return this.botType === Xt.SARDAR; 
} });

Object.defineProperty(Bot.prototype, 'onLobby', { get: function () {
	return this.get('state') === Xs.LOBBY;
}})

Object.defineProperty(Bot.prototype, 'inRoom', { get: function () {
	return this.get('state') === Xs.ROOM || this.get('state') === Xs.TABLE || this.get('state') === Xs.GAME;
}})

Object.defineProperty(Bot.prototype, 'onTable', { get: function () {
	return this.get('state') === Xs.TABLE || this.get('state') === Xs.GAME;
}})

Object.defineProperty(Bot.prototype, 'inGame', { get: function () {
	return this.get('state') === Xs.GAME;
}})

Object.defineProperty(Bot.prototype, 'mySeatIndex', { get: function () {
	var bot = this;
	var t = bot.get('myTable');
	if(t){
		// console.log('3334',t.players);
		for (var i = 0; i < t.players.length; i++) {
			if(bot.get('playerId')=== t.players[i].playerId){
				return t.players[i].seatIndex;
			}
		}
	}
}})

Bot.prototype.gotASeat = function() {
	var bot = this;
	bot.set('state', Xs.TABLE);
};

Bot.prototype.gotToPlay = function(flag) {
	var bot = this;
	if(flag){
		bot.set('state', Xs.GAME);
	}else {
		bot.set('state', Xs.TABLE);
	}
};

Bot.prototype.hitAckReply = function(params) {
	var bot = this;
	var py = {};
	// console.log('444666', params, py, bot.pomelo)
	bot.pomelo.notify(hits.ackReply.toString(), bot.getPayload(hits.ackReply, py))
};

Bot.prototype.getPayload = function(hitName, input) {
	var bot = this;
	// console.log(hitName);
	var hitName = hitName.toString(); // MUST
	// console.log("***********************"+hitName+ "********************"+JSON.stringify(input));
	var r = {};
	switch(hitName){
		case hits.register.toString(): 
			r.loginType    = input.type;
		  r.deviceType   = "browser";
		  r.loginMode    = "normal";
		  r.userName     = bot.profile.userName || bot.profile.name;
		  r.emailId      = bot.profile.email;
		  r.password     = bot.profile.password;
		  r.mobileNumber = bot.profile.mobileNumber;
		  r.regotp       = "-111";
		  r.deviceType = "androidApp";
		  r.appVersion = "1.0";
		  r.ipV4Address  = '::ffff:192.168.2.35';
		  r.ipV6Address  = '::ffff:192.168.2.35';
		  r.bot          = bot.botType;
		  r.isBot        = true;
			break;
		case hits.entry.toString():
			r.playerId      = bot.get("playerId");
			r.isRequested   = true;
			r.playerName    = bot.get("playerName");
			break;
		case hits.getTables.toString():
			// r.casinoId = 1;
			r.playerId    = bot.get('playerId');
			r.isRealMoney = true;
			r.channelVariation = "Omaha";
			break;
		case hits.joinChannel.toString():
			r.playerId = bot.get('playerId'), r.channelId = bot.get('toJoinTableId'),
			r.playerName    = bot.get("playerName");
			r.isRequested = true, r.channelType = 'normal', r.tableId = '';
			break;
		case hits.sit.toString():
			r.playerId       = bot.get('playerId');
			r.channelId      = bot.get('myTable').channelId;
			r.playerName     = bot.get("playerName");
			r.chips          = input.chips || bot.get('myTable').getData('minBuyIn');
			r.seatIndex      = bot.get('myTable').getEmptySeat();
			r.imageAvtar     = bot.profile.imageAvtar || defaultImageAvtar;
			r.isAutoReBuy    = true;
			r.isAutoTopUp    = false;
			r.isAntiBanking  = input.isAntiBanking;
			r.networkIp      = '::ffff:192.168.2.35';
			r.isRequested    = true;
			break;
		case hits.move.toString():
			r.channelId = bot.get('myTable').channelId;
			r.playerId = bot.get('playerId');
			r.amount = input.amount;
			r.action = input.action;
			r.isRequested = true;
			break;
		case hits.leave.toString():
			r.channelId = input.channelId;
			r.isStandUp = !!input.isStandUp; r.isRequested = true;
			break;
		case hits.updateProfile.toString():
		  r.data = input;
		case hits.ackReply.toString():
			r.playerId = bot.get('playerId');
			r.isLoggedIn = true;
			r.data = (typeof input == 'object') ? input : {};
		default:
			r.authToken = bot.get('token');
			break;
	}
	return r;
};

module.exports = Bot;

function setDefaults(bot) {
	bot.settings.playerId = '';
	bot.settings.token = '';
	bot.settings.state = Xs.STREET;
}

