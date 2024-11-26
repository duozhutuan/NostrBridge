// relay.js
import { registerClient, removeClient, getClient ,clients} from './clients.js';
import { v4 as uuidv4 } from 'uuid'; 
// 处理 WebSocket 连接和消息
export function handleRelay(ws) {
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
                    targetClient.send(JSON.stringify({ action: 'message', from: data.from, message: data.message }));
                    console.log(`Message forwarded from ${data.from} to ${data.to}`);
                } else {
                    // 如果目标客户端不在线，返回错误
                    ws.send(JSON.stringify({ action: 'message', status: 'error', message: `Client ${data.to} not found` }));
                }
            } else {
                ws.send(JSON.stringify({ status: 'error', message: 'Invalid action or missing parameters' }));
            }
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({ status: 'error', message: 'Invalid message format' }));
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
