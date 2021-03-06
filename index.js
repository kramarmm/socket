// const server = require('http').createServer((req, res) => {
// console.log('req.type => ', req.type);
// 	res.send('success');
// });

const WebSocket = require('ws');
const wss = new WebSocket.Server({
  port: process.env.PORT,
  perMessageDeflate: false
});

let counter = 0;

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', function connection(ws) {
  console.log('connection ', ++counter);

  ws.isAlive = true;
  ws.on('pong', heartbeat); // PONG

  ws.on('message', function incoming(message) { // MESSAGE
    try {
      const msg = JSON.parse(message);
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      console.log('MESSAGE => ', msg.username);

      msg.time = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;

      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    } catch (error) {
      console.log(`Error on handling message: ${error}`);
    }
  });

  ws.on('close', function(code, ...args) { // CLOSE
    console.log(`CLOSE => ${code} - reason: ${args}`);
  });

  ws.on('error', function(error) { // ERROR
  	console.log('ERROR => ', error);
  });
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 5000);

console.log('Weeeeee :)');
// server.listen(process.env.PORT);
