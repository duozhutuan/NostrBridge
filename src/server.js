// server.js
import { handleUserMessage } from './user-message-forwarder.js';
import { handleHub,registerRelayServer,connectRelayServer,establishClientRelayConnection } from './relay-forwarder.js';
import { cacheRelay } from './cache-relay.js'

import { WebSocketServer } from 'ws';  // 正确的导入方式
import { parse } from 'url';

let port = 8088
const wss = new WebSocketServer({ port: port });


wss.on('connection', (ws,req) => {
    const parsedUrl = parse(req.url, true);
    var targetUrl = parsedUrl.pathname.slice(1);  
    console.log(req.url)

    if (targetUrl.startsWith('wss:/') || targetUrl.startsWith('ws:/')) {
        handleHub(ws, req.url);
        return;
    }

    const [path, identifier] = targetUrl.split('/');
    switch (path) {
        case 'registerrelay':
            registerRelayServer(ws, identifier);
            break;
        case 'pubkey':
            connectRelayServer(ws, identifier);
            break;
        case 'establishconnection':
            establishClientRelayConnection(ws, identifier);
            break;
        case 'cacherelay':
             new cacheRelay(ws);   
             break; 
        case 'client': //client to client
        default:
            handleUserMessage(ws);
            break;
    }

});

console.log(`WebSocket server is running on ws://localhost:${port}`);


