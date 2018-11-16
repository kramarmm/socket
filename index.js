const server = require('http').createServer();

const WebSocket = require('ws');
const wss = new WebSocket.Server({
  server,
  perMessageDeflate: false
});

let counter = 0;

function heartbeat() {
  this.isAlive = true;
}

const interval = setInterval(() => {
  wss.clients.forEach(function(ws) {
    if (ws.isAlive === false) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(() => {});
  });
}, 30000);

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
        console.log('client.readyState => ', client.readyState);
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    } catch (error) {
      console.log(`Error on handling message: ${error}`);
    }
  });

  ws.on('close', function(code, reason) { // CLOSE
    console.log(`CLOSE => ${code} - reason: ${reason}`);
  });

  ws.on('error', function(error) { // ERROR
  	console.log('ERROR => ', error);
  });
});

console.log('Weeeeee :)');
server.listen(process.env.PORT);
