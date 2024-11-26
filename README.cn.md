# NostrBridge 功能说明

NostrBridge 提供了两项核心功能，旨在帮助用户实现 Nostr 协议下的 WebSocket 连接转发和消息转发。以下是功能的详细描述：

## 功能一：WebSocket 连接转发

NostrBridge 的第一个功能是将 WebSocket 连接从一个服务器转发到另一个指定的 Nostr relay 服务器。

具体来说，当连接 `wss://myserver.com/wss://relay.nostr.band/` 时，NostrBridge 会将请求转发到目标地址 `wss://relay.nostr.band/`，这个地址可以是任何支持 Nostr 协议的 relay 服务器。

### 说明：
- **源连接：** `wss://myserver.com/wss://relay.nostr.band/`
- **目标连接：** `wss://relay.nostr.band/`（可以是任何其他支持 Nostr 协议的 relay 服务器）

---

## 功能二：消息转发

NostrBridge 的第二个功能是实现消息在两个 Nostr 客户端之间的转发。通过连接到 `wss://myserver.com`，NostrBridge 可以根据预定格式将消息从一个客户端转发到另一个客户端。

消息格式如下：

```javascript
const messageData = {
    action: 'message',
    from: from,      // 发送者客户端
    to: to,          // 接收者客户端
    message: message // 消息内容
};

