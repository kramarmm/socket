const server = require('http').createServer();

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

const clients = {};

wss.on('connection', ws => {
  ws.on('message', message => {
    switch (message.type) {
      case 'add-client':
        clients[message.data.username] = {
          ws: ws.id,
          ...message.data,
        };
        break;

      case 'send-message':
        ws.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message.data);
          }
        });
        break;

      default:
        console.log('Unknown type');
    }
  });

  ws.on('close', () => {
  	for(let name in clients) {
  		if(clients[name].ws === ws.id) {
  			delete clients[name];
  			break;
  		}
  	}
  });
});

console.log(12);
server.listen(8080);