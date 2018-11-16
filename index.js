const server = require('http').createServer();

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

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
  ws.isAlive = true;
  ws.on('pong', heartbeat); // PONG

  ws.on('message', message => { // MESSAGE
    try {
      const msg = JSON.parse(message);

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg.data));
        }
      });
    } catch (error) {
      console.log(`Error on handling message: ${error}`);
    }
  });

  ws.on('close', (code, reason) => { // CLOSE
    console.log(`${code} - reason: ${reason}`);
    clearInterval(interval);
  });

  ws.on('error', error => { // ERROR
  	console.log('error => ', error);
    clearInterval(interval);
  });
});

console.log('Weeeeee :)');
server.listen(process.env.PORT);
