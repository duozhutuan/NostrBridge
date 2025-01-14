// server.js
import { handleUserMessage } from './user-message-forwarder.js';
import { handleHub,registerRelayServer,connectRelayServer,establishClientRelayConnection } from './relay-forwarder.js';

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
            
        case 'client': //client to client
        default:
            handleUserMessage(ws);
            break;
    }

});

console.log(`WebSocket server is running on ws://localhost:${port}`);
/*
import http from 'http';
import dotenv from 'dotenv';
import { matchFilters, matchFilter } from 'nostr-tools';
import { WebSocketServer } from 'ws';

dotenv.config();

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.headers.accept === 'application/nostr+json') {
    res.writeHead(200, {
      'Content-Type': 'application/nostr+json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    });

    res.end(
      JSON.stringify({
        name: 'Bucket',
        icon: 'https://pfp.nostr.build/65b0af6eb8b103d11b2012d6215fe5a25d1eabc41e0a4dbc383ce02bd739cf28.png',
        description: 'An ephemeral dev relay',
        pubkey: 'c8a296e7633c87e2b5cb0fe37ffcccce00a4fb076fab1daea0077fcf88954f4e',
        software: 'https://github.com/coracle-social/bucket',
      })
    );
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const pid = Math.random().toString().slice(2, 8);
const wss = new WebSocketServer({ server });

server.listen(process.env.PORT, () => {
  console.log('Running on port', process.env.PORT);
});

let connCount = 0;
let events = [];
let subs = new Map();

let lastPurge = Date.now();

if (process.env.PURGE_INTERVAL) {
  console.log('Purging events every', process.env.PURGE_INTERVAL, 'seconds');
  setInterval(() => {
    lastPurge = Date.now();
    events = [];
  }, process.env.PURGE_INTERVAL * 1000);
}

wss.on('connection', (socket) => {
  connCount += 1;

  console.log('Received connection', { pid, connCount });

  const relay = new Instance(socket);

  if (process.env.PURGE_INTERVAL) {
    const now = Date.now();
    relay.send([
      'NOTICE',
      '',
      'Next purge in ' +
        Math.round((process.env.PURGE_INTERVAL * 1000 - (now - lastPurge)) / 1000) +
        ' seconds',
    ]);
  }

  socket.on('message', (msg) => relay.handle(msg));
  socket.on('error', (e) => console.error('Received error on client socket', e));
  socket.on('close', () => {
    relay.cleanup();

    connCount -= 1;

    console.log('Closing connection', { pid, connCount });
  });
});

class Instance {
  constructor(socket) {
    this._socket = socket;
    this._subs = new Set();
  }

  cleanup() {
    this._socket.close();

    for (const subId of this._subs) {
      this.removeSub(subId);
    }
  }

  addSub(subId, filters) {
    subs.set(subId, { instance: this, filters });
    this._subs.add(subId);
  }

  removeSub(subId) {
    subs.delete(subId);
    this._subs.delete(subId);
  }

  send(message) {
    this._socket.send(JSON.stringify(message));
  }

  handle(message) {
    try {
      message = JSON.parse(message);
    } catch (e) {
      this.send(['NOTICE', '', 'Unable to parse message']);
    }

    let verb, payload;
    try {
      [verb, ...payload] = message;
    } catch (e) {
      this.send(['NOTICE', '', 'Unable to read message']);
    }

    const handler = this[`on${verb}`];

    if (handler) {
      handler.call(this, ...payload);
    } else {
      this.send(['NOTICE', '', 'Unable to handle message']);
    }
  }

  onCLOSE(subId) {
    this.removeSub(subId);
  }

  onREQ(subId, ...filters) {
    console.log('REQ', subId, ...filters);

    this.addSub(subId, filters);

    for (const filter of filters) {
      let limitCount = filter.limit;
      if (limitCount <= 0) {
        console.log('miss events due to limit=0 on subscription:', subId);
        continue;
      }
      for (const event of events) {
        if (limitCount > 0 || limitCount == undefined) {
          if (matchFilter(filter, event)) {
            console.log('match', subId, event);

            this.send(['EVENT', subId, event]);
          } else {
            console.log('miss', subId, event);
          }
          limitCount = limitCount ? limitCount - 1 : undefined;
        }
      }
    }

    console.log('EOSE');

    this.send(['EOSE', subId]);
  }

  onEVENT(event) {
    events = events.concat(event).sort((a, b) => (a > b ? -1 : 1));

    console.log('EVENT', event, true);

    this.send(['OK', event.id, true, '']);

    for (const [subId, { instance, filters }] of subs.entries()) {
      if (matchFilters(filters, event)) {
        console.log('match', subId, event);

        instance.send(['EVENT', subId, event]);
      }
    }
  }
} */
