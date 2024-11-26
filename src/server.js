// server.js
import { handleRelay } from './relay.js';
import { handleHub } from './hub.js';

import { WebSocketServer } from 'ws';  // 正确的导入方式
import { parse } from 'url';

let port = 8080
const wss = new WebSocketServer({ port: port });


wss.on('connection', (ws,req) => {
    const parsedUrl = parse(req.url, true);
    var targetUrl = parsedUrl.pathname.slice(1); 

    if (!targetUrl.startsWith('wss://') && !targetUrl.startsWith("ws://")) {
        handleRelay(ws);
    } else {
        handleHub(ws,req);
    }

});

console.log(`WebSocket server is running on ws://localhost:${port}`);

