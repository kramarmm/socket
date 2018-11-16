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
  	console.log('MESSAGE');
    try {
      const msg = JSON.parse(message);
      const date = new Date();
      msg.time = `${date.getHours()}:${date.getMinutes()}`;

      wss.clients.forEach(client => {
        console.log('client.readyState => ', client.readyState);
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
    clearInterval(interval);
  });

  ws.on('error', error => { // ERROR
  	console.log('ERROR => ', error);
    clearInterval(interval);
  });
});

console.log('Weeeeee :)');
server.listen(process.env.PORT);
