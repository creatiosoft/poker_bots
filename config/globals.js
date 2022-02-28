var globals = {}
var botType = globals.botType = {};
var botState = globals.botState = {};
var sardarModes = globals.sardarModes = {};
var tableDecisionModes = globals.tableDecisionModes = {}
var modeCmds = globals.modeCmds = {}


botType.SARDAR = 'SARDAR';
botType.PLAYER = 'PLAYER';

// each number OR greater than that (until just before next state) for state, is also same state
// e.g. if state is from 100 to 199; it is said to be on STREET or BEFORE LOBBY
// ON STREET is 100
// ON OR AFTER LOBBY is >=200
botState.STREET = 100;
botState.LOBBY = 200;
botState.ROOM = 300;
botState.TABLE = 400;
botState.GAME = 500;

botState.STREET_REGD = 110;
botState.STREET_TOKEN = 140;
botState.STREET_TOKEN_IP = 150;


tableDecisionModes.FULL = 'AA';

sardarModes.CUSTOM = 'ZZ';//'CUSTOM';
sardarModes.FULL_ALL_TABLES = 'A';//;
sardarModes.FULL_A_TABLE = 'B';// random if no valid channelId is provided
sardarModes.FULL_n_TABLES = 'C';
sardarModes.A_SEAT_ON_ALL_TABLES = 'D';
sardarModes.n_SEATS_ON_ALL_TABLES = 'E';
sardarModes.m_SEATS_ON_n_TABLES = 'F';
sardarModes.GAME_ON_ALL_TABLES = 'G';
sardarModes.GAME_ON_n_TABLES = 'H';
sardarModes.GAME_ON_ALL_NONEMPTY_TABLES = 'I';

modeCmds[sardarModes.CUSTOM] = 'new Object($["modeObj"])'; // modeObj should follow similar syntax as shown below
modeCmds[sardarModes.FULL_ALL_TABLES] = 'new Object({ SEAT:0, TABLE:0})';
modeCmds[sardarModes.FULL_A_TABLE] = 'new Object({ SEAT:0, TABLE:1})';
modeCmds[sardarModes.FULL_n_TABLES] = 'new Object({ SEAT:0, TABLE:$["n"]})';
modeCmds[sardarModes.A_SEAT_ON_ALL_TABLES] = 'new Object({ SEAT:1, TABLE:0})';
modeCmds[sardarModes.n_SEATS_ON_ALL_TABLES] = 'new Object({ SEAT:$["n"], TABLE:0})';
modeCmds[sardarModes.m_SEATS_ON_n_TABLES] = 'new Object({ SEAT:$["m"], TABLE:$["n"]})';
modeCmds[sardarModes.GAME_ON_ALL_TABLES] = 'new Object({ GAME:true, TABLE:0})';
modeCmds[sardarModes.GAME_ON_n_TABLES] = 'new Object({ GAME:true, TABLE:$["n"]})';
modeCmds[sardarModes.GAME_ON_ALL_NONEMPTY_TABLES] = 'new Object({ GAME:true, TABLE:{value:0, filter: "seatsOccupied>0"}})';


module.exports = globals;