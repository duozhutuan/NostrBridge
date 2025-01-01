# NostrBridge
NostrBridge provides one-to-one message forwarding as a relay server between NOSTR clients.

# NostrBridge Functionality Overview

NostrBridge provides two core features aimed at facilitating WebSocket connection forwarding and message forwarding under the Nostr protocol. Below is a detailed description of these features:

## Feature 1: WebSocket Connection Forwarding

The first feature of NostrBridge is to forward a WebSocket connection from one server to a specified Nostr relay server.

Specifically, when connecting to `wss://myserver.com/wss://relay.nostr.band/`, NostrBridge will forward the request to the target address `wss://relay.nostr.band/`, which can be any relay server supporting the Nostr protocol.

### Explanation:
- **Source connection:** `wss://myserver.com/wss://relay.nostr.band/`
- **Target connection:** `wss://relay.nostr.band/` (can be any other relay server supporting the Nostr protocol)

---

## Feature 2: Message Forwarding

The second feature of NostrBridge allows for forwarding messages between two Nostr clients. By connecting to `wss://myserver.com`, NostrBridge can forward messages from one client to another based on the predefined message format.

The message format is as follows:

```javascript
const messageData = {
    action: 'message',
    from: from,      // Sender client
    to: to,          // Receiver client
    message: message // Message content
};
```

## add connect relay by pubkey
map relay {pubkey:relayserver}
- ** relay server register pubkey to bridge**
- client connect relay server by bridge + pubkey

```
url = "wss://bridge.xxx.com/pubkey/1ba6b866701217bf985dc6c7206b87dc473be936cef856cba753a25e6ba1c3a4"
new WebSocket(url)
```

## How to register my relay to the bridge.

```
node src/cli.js
```

cli.js by config.js register your relay server to bridge

## Can my relay server be on a local network or the internet? Can a local network also work?
Yes. support IP is 192.168.1.xxx .

**Process Flow:**
<img src="https://raw.githubusercontent.com/duozhutuan/nostrbridge/master/docs/bridge.drawio.png" alt="drawing" />

### Prerequisites

- **Bridge Server**: Domain name `bridge.xxx.com`
- **Relay Server**:
  - Public Domain: `relay.xxx.com`
  - Private Network 
- **Client**

### Usage Rules

1. **Accessing Relay Server through Bridge**
   - Users can access the Relay server through the Bridge server using the format: `wss://bridge.xxx.com/wss://relay.xxx.com`
   
2. **Accessing Relay Server via Bridge using PubKey**
   - Users can access the Relay server through the Bridge server using the format: `wss://bridge.xxx.com/pubkey/[PubKey]`
   - This requires the Relay server to be registered with the Bridge server

3. **Accessing Private Network Relay Server through Bridge using PubKey**
   - Users can access the Private Network Relay server through the Bridge server and PubKey using the format: `wss://bridge.xxx.com/pubkey/[PubKey]`
   - This requires the Private Network Relay server to be registered with the Bridge server

4. **Directly Accessing Public Relay Server**
   - Users can directly access the Public Relay server but cannot directly access the Private Network Relay server

## Deploy nostrbridge to your server as a bridge.

### start server
```
forever start src/server.js
```

### nginx config
```
vim /etc/nginx/sites-enabled/xxx.conf 

add :

map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
}

upstream websocketio {
        server 127.0.0.1:8xx9;
}

server {
    listen 80;
    server_name bridge.xxxx.com ;

    location / {
        proxy_pass http://websocketio;
	    proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_connect_timeout 60s;
            proxy_read_timeout 600s;
    }
}

```

access :

wss://bridge.xxxx.com/wss://relay.target.com

