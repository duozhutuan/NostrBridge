// server.js
import { handleConnection } from './relay.js';

import { WebSocketServer } from 'ws';  // 正确的导入方式

const wss = new WebSocketServer({ port: 8080 });


wss.on('connection', handleConnection);

console.log('WebSocket server is running on ws://localhost:8080');

