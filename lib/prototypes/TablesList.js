/*
* @Author: sushiljainam
* @Date:   2017-05-25 12:28:56
* @Last Modified by:   sushiljainam
* @Last Modified time: 2017-06-02 19:09:31
*/

var botPath = '../../'; // maintain this in every file acc to file's position; ends with slash; work like undot

var Table = require(botPath+'lib/prototypes/Table');
var globals = require(botPath+'config/globals');

var Xm = globals.sardarModes;
var Xmc = globals.modeCmds;
var Xtm = globals.tableDecisionModes;

// generally botSardar uses this to maintain list of all tables

function TablesList(params) {
	var that = this;
	if (params instanceof Array) {
		that.tables = [];
		for (var i = 0; i < params.length; i++) {
			var rawTable = params[i];
			var t = new Table(rawTable);
			if(t.isProperTable()){
				that.tables.push(t);
			}
		}
	} else if(params instanceof Table){
		that.tables = [];
		if(t.isProperTable()){
			that.tables.push(t);
		}
	} else if(params instanceof Object){
		that.tables = [];
		var t = new Table(params);
		if(t.isProperTable()){
			that.tables.push(t);
		}
	} else {
		that.tables = [];
		console.log('input ignored, list is empty');
	}

	return that; // return is optional, we are using new operator anyway.
}

Object.defineProperty(TablesList.prototype, 'length', {get: function () {
	return this.tables.length;
}})

// TablesList.prototype.length = function() {
// 	return this.tables.length;
// };

TablesList.prototype.add = function(params) {
	var that = this;
	if(params instanceof Table){
		that.tables = [];
		if(t.isProperTable()){
			that.tables.push(t);
			return true;
		}
	} else if(params instanceof Object){
		that.tables = [];
		var t = new Table(params);
		if(t.isProperTable()){
			that.tables.push(t);
			return true;
		}
	}
	return false;
};

TablesList.prototype.update = function(id, data) {
	var that = this;
	// TO UPDATE PLAYERS actually
	for (var i = 0; i < that.tables.length; i++) {
		// TODO: that.tables[i].updatePlayers()
		// return updated table back
	}
};

TablesList.prototype.remove = function(id) {
	var that = this;
};

TablesList.prototype.findRandomTable = function() {
	var tables = this.tables;
	return tables[Math.floor(Math.random()*tables.length)];
};

TablesList.prototype.findRandomTableWithFilter = function(len, pred) {
	var tables = this.tables;
	var c=0,selInd=[];
	len = len || 5;
	if(!(pred && pred instanceof Function)){
		pred = function () { return true; };
	}
	for (var i = 0; i < tables.length; i++) {
		if(pred(tables[i])){
			if (c >= len) {break;}
			c++;selInd.push(i);
		}
	}
	var j = selInd[Math.floor(Math.random()*selInd.length)];
	return ((j>=0) && tables[j]);
};

TablesList.prototype.findTableById = function(id) {
	var that = this;
	for (var i = 0; i < that.tables.length; i++) {
		if (that.tables[i].channelId===id) {
			return that.tables[i];
		}
	}
	return false;
};

TablesList.prototype.findTablesByFilters = function(filters) {
	var that = this;
};

TablesList.prototype.find = function(id) {
	var that = this;
};

TablesList.prototype.setDecisions = function(decisionParams) {
	var that = this;
	// TODO: handle eval and then decision object
	var $ = decisionParams;
	var modeObj = eval(Xmc[decisionParams.mode]);
	// TODO : do it later
	console.log(modeObj,'.......');
	if(typeof modeObj.TABLE === 'number'){
		// rules for n OR all tables
		var len = modeObj.TABLE || that.tables.length
		var modePer = (typeof modeObj.SEAT === 'number') ? {mode: true, SEAT: modeObj.SEAT} : {};
		for (var i = 0; i < len; i++) { // TODO: later -- make it better random
			var t = that.findRandomTableWithFilter(2*len, function (table) {
				return !table.getDecisions().mode;
			}); // predicate: whose decision mode is unset: Done
			if(t){
				t.setDecisions(modePer);
			}
		}
		return true;
	} else if(typeof modeObj.TABLE === 'object') {
		// needs to filter

	}
	/*
	if(decisionParams.mode === Xm.FULL_A_TABLE){
		if(typeof decisionParams.channelId == 'string'){
			var t = that.findTableById(decisionParams.channelId);
			if(t){
				return t.setDecisions({mode: Xtm.FULL});
				
			}
		}
		// Either channelId is not string OR no table with that channelId
		var t = that.findRandomTableWithFilter(5, function (table) {
			return !table.getDecisions().mode;
		}); // predicate: whose decision mode is unset: Done
		if(t){
			return t.setDecisions({mode: Xtm.FULL});
			
		}
	} else if (decisionParams.mode === Xm.FULL_ALL_TABLES) {
		for (var i = 0; i < that.tables.length; i++) {
			that.tables[i].setDecisions({mode: Xtm.FULL});
		}
		return true;
	}
	*/
	console.log(t, that.tables, '-------------------')
};

module.exports = TablesList;
