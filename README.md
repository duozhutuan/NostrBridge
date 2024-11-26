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

