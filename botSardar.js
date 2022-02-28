var CMD_ARGS = process.argv.slice(2); // sliced 2 args

var async = require('async');
var botPath = './'; // maintain this in every file acc to file's position; ends with slash; work like undot
var globals = require(botPath+'config/globals');

var BotSardar = require(botPath+'lib/prototypes/BotSardar');

var Xm = globals.sardarModes;
var Xt = globals.botType;


var botSardar = new BotSardar({botType: Xt.SARDAR, name:'upkaran', email:'upkaran@cs.com'});

console.log(botSardar);


var params = {};
// params.mode = Xm.FULL_ALL_TABLES;
// params.mode = Xm.FULL_A_TABLE;
// params.mode = Xm.FULL_n_TABLES;
// params.mode = Xm.A_SEAT_ON_ALL_TABLES;
// params.mode = Xm.n_SEATS_ON_ALL_TABLES;
params.mode = Xm.m_SEATS_ON_n_TABLES;
// params.mode = Xm.GAME_ON_ALL_TABLES;
// params.mode = Xm.GAME_ON_n_TABLES;
// params.mode = Xm.GAME_ON_ALL_NONEMPTY_TABLES;
params.n = 14;
params.m = 4; // m & n can be negative too; that means apply that mode to EXCEPT so many
// params.channelId = '5926da973b21fd46bb836eef';
botSardar.launch(params); // what more params does this need? // what does it return


