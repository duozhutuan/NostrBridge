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

## add connect relay by pubkey
map relay {pubkey:relayserver}
- ** relay server register pubkey to bridge**
- client connect relay server by bridge + pubkey
```
url = "wss://bridge.xxx.com/1ba6b866701217bf985dc6c7206b87dc473be936cef856cba753a25e6ba1c3a4"
new WebSocket(url)
```

## How to register my relay to the bridge.

```
node src/cli.js
```

cli.js by config.js register your relay server to bridge

## Can my relay server be on a local network or the internet? Can a local network also work?
Yes. support IP is 192.168.1.xxx .


