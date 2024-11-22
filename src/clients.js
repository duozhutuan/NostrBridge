// clients.js
export let clients = {};  // 用于存储 clientId 和对应的 WebSocket 连接

// 添加或移除客户端
export function registerClient(clientId, ws) {
    clients[clientId] = ws;
}

export function removeClient(clientId) {
    delete clients[clientId];
}

export function getClient(clientId) {
    return clients[clientId];
}

