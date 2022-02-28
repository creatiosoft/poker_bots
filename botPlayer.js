/*
* @Author: sushiljainam
* @Date:   2017-05-24 17:22:35
* @Last Modified by:   sushiljainam
* @Last Modified time: 2017-05-25 18:01:40
*/

var CMD_ARGS = process.argv.slice(2); // sliced 2 args

var async = require('async');
var botPath = './'; // maintain this in every file acc to file's position; ends with slash; work like undot
var globals = require(botPath+'config/globals');

var BotPlayer = require(botPath+'lib/prototypes/BotPlayer');

var Xm = globals.sardarModes;
var Xt = globals.botType;

var args = JSON.parse(CMD_ARGS[0]);// = {name: 'bot1', email:'bot1@cs.com', channelId: '59259d0e34032c5e163536b2'}
var botPlayer = new BotPlayer({botType: Xt.PLAYER, name: args.name, email: args.email || (args.name+'@cs.com')});

console.log(botPlayer);

botPlayer.launch({mode: Xm.FREE, table: {channelId: args.channelId}}); // what more params does this need? // what does it return


