// user-message-forwarder.js
import { v4 as uuidv4 } from 'uuid'; 

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



// 处理 WebSocket 连接和消息
export function handleUserMessage(ws) {
    console.log('New client connected');
    const clientId = uuidv4(); 

    registerClient(clientId, ws);
    console.log(`Client Id : ${clientId}`);
    // 处理客户端发送的消息
    ws.send(JSON.stringify({ action: 'clientId',  content: clientId }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

                    
            if (data.action === 'message' && data.to && data.message) {
                const targetClient = getClient(data.to);

                if (targetClient) {
                    // 转发消息给目标客户端
                    targetClient.send(JSON.stringify({ action: 'message', from: data.from, to:data.to,code:data.code, message: data.message }));
                    console.log(`Message forwarded from ${data.from} to ${data.to}`);
                } else {
                    // 如果目标客户端不在线，返回错误
                    ws.send(JSON.stringify({ action: 'message', status: 'error', code:404,message: `Client ${data.to} not found` }));
                }
            } else {
                ws.send(JSON.stringify({ status: 'error', code:502,message: 'Invalid action or missing parameters' }));
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ status: 'error',code:502, message: 'Invalid message format' }));
        }
    });

    // 处理 WebSocket 关闭
    ws.on('close', () => {
        // 移除已断开连接的客户端
        Object.keys(clients).forEach((clientId) => {
            if (clients[clientId] === ws) {
                removeClient(clientId);
                console.log(`Client with ${clientId} disconnected`);
            }
        });
    });
}

