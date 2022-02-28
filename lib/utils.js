/*
* @Author: Sushil Jain
* @Date:   2017-05-23 15:02:49
* @Last Modified by:   sushiljainam
* @Last Modified time: 2017-05-29 18:04:35
*/

var nodeClient = require('pomelo-node-client-websocket');


module.exports.randomString = function (len) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < (len||20); i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

module.exports.randomNumber = function (len) {
	var text = "";
	var possible = "0123456789";
	var possible1 = "123456789";
	text += possible1.charAt(Math.floor(Math.random() * possible1.length));
	for (var i = 1; i < (len||10); i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

module.exports.getWindowObj = function () {
	//var mock = new MockBrowser();
	//window = mock.getWindow();

	//window.WebSocket = require('ws');
	return nodeClient.create();
}

module.exports.verifyRes = function (res) {
	if(! typeof res === 'object'){
		return false;
	}
	if(!(!!res.route && typeof res.route === 'string')){
		return false;
	}
	// NOW check for route dictionary and keys acc to that: TODO
	// and then finally return success flag
	return res.success;
}

module.exports.range = function (till) {
	var r = [];
	for (var i = 1; i <= till; i++) {
		r.push(i);
	}
	return r;
}

// data is an array, having objects in format : {percent: Number, ...}
module.exports.randomWithProb = function (data) {
	// var data = [{percent:10,value:"fold"},{percent:50,value:"check"},{percent:20,value:"raise"}]; 
	var r = Math.random()*100;
	var s = 0;
	for (var i = 0; i < data.length; i++) {
		var d = data[i];
		// console.log(d,r,s,d.percent+s)
		if (s+d.percent>=r) {
			return d;
		}
		s+=d.percent;
	}
	return d;
}

var test = function () {for (var i = 0; i < 10; i++) {console.log(module.exports.randomWithProb()); } }
// test();