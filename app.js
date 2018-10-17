const TankBot = require('./src/bot.js');

let port = 8052;
let host = 'localhost';
let tankName ='UnemployedAngus';
new TankBot(host, port, tankName);