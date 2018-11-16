const server = require('http').createServer();

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

let counter = 0;

function heartbeat() {
  this.isAlive = true;
}

const interval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(() => {});
  });
}, 30000);

wss.on('connection', ws => {
  console.log('connection ', ++counter);

  ws.isAlive = true;
  ws.on('pong', heartbeat); // PONG

  ws.on('message', message => { // MESSAGE
  	console.log('MESSAGE');
    try {
      const msg = JSON.parse(message);
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      msg.time = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    } catch (error) {
      console.log(`Error on handling message: ${error}`);
    }
  });

  ws.on('close', (code, reason) => { // CLOSE
    console.log(`CLOSE => ${code} - reason: ${reason}`);
  });

  ws.on('error', error => { // ERROR
  	console.log('ERROR => ', error);
  });
});

console.log('Weeeeee :)');
server.listen(process.env.PORT);
