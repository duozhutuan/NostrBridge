
// Forward WebSocket connections to another relay server
import { join } from 'path';
import { parse } from 'url';
import  WebSocket  from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { schnorr } from "@noble/curves/secp256k1";
import { bytesToHex ,hexToBytes }  from "@noble/hashes/utils";


let pubkeyServers = {};  // 用于存储 clientId 和对应的 WebSocket 连接

// 添加或移除客户端
function registerServer(pubkey, ws) {
    pubkeyServers[pubkey] = ws;
}

function removeServer(pubkey) {
    delete pubkeyServers[pubkey];
}

function getServer(pubkey) {
    return pubkeyServers[pubkey];
}

let UidtoServers = {};  // 用于存储 clientId 和对应的 WebSocket 连接

// 添加或移除客户端
function registerUidServer(Uid, ws) {
    UidtoServers[Uid] = ws;
}

function removeUidServer(Uid) {
    delete UidtoServers[Uid];
}

function getUidServer(Uid) {
    return UidtoServers[Uid];
}


export function registerRelayServer(ws,pubkey){
    const clientId = uuidv4(); 
    const sid = new TextEncoder().encode(clientId);
    ws.send(JSON.stringify({"type":'sig',"clientId":clientId}))
    ws.on("message",(message)=>{
        if (Buffer.isBuffer(message)) {
             message = message.toString('utf-8');
        }
        let data = JSON.parse(message)
        if (data.type == "sig"){
            let verify = schnorr.verify(hexToBytes(data.sig), sid, pubkey);
            console.log("Verify true,register RelayServer",pubkey)
            if (verify){
                registerServer(pubkey,ws)
                ws.send(JSON.stringify({"type":'register',"message":"register ok!"}))
            } else {
                ws.send(JSON.stringify({"type":'error',"message":"verify false!"}))
            }
        }
                
    })
    ws.on("error",(message)=>{
        console.log(message)
    })
}


export function  connectRelayServer(ws,pubkey){

    let targetrelay = getServer(pubkey);
    if (!targetrelay){
        ws.close();
        return ;
    }
    const clientId = uuidv4(); 
    registerUidServer(clientId,ws)
    targetrelay.send(JSON.stringify({type:"newconnect",clientuid:clientId}))
    ws.Queue = []
    ws.on('message', (message) => {
        if (ws.Queue){
            ws.Queue.push(message)
        }
    });

    
}
export function establishClientRelayConnection(ws,Uid){
    let targetWs = getUidServer(Uid)    
    let oldmessage = targetWs.Queue.slice()
    targetWs.Queue = ""
    
    ws.on('message', (message) => {
        if (Buffer.isBuffer(message)) {
             message = message.toString('utf-8');
        }

          console.log(message)


          const sendWhenReady = () => {
              if (targetWs.readyState === WebSocket.OPEN) {
                  targetWs.send(message);
              } else {
                      //wait 500ms
                  setTimeout(sendWhenReady, 500);
              }
          };

          sendWhenReady();
    });

    targetWs.on('message', (message) => {
            if (Buffer.isBuffer(message)) {
                message = message.toString('utf-8');
            }

            if (ws.readyState === WebSocket.OPEN) {
                console.log(message);
                ws.send(message);
            }
    });
        
    ws.on('close', () => {
            try {
                targetWs.close();
            } catch {
            }
    });

    targetWs.on('close', () => {
            try {
                ws.close();
            } catch {
            }
    });

    oldmessage.map( message => {

            if (Buffer.isBuffer(message)) {
                message = message.toString('utf-8');
            }

            if (ws.readyState === WebSocket.OPEN) {
                console.log(message);
                ws.send(message);
            }
    })

}
export function handleHub(ws,url){

    const parsedUrl = parse(url, true);
    var targetUrl = parsedUrl.pathname.slice(1); 

    if (targetUrl.startsWith('wss:/') && !targetUrl.startsWith('wss://')) {
        targetUrl = targetUrl.replace('wss:/', 'wss://');
    }

    if (targetUrl.startsWith('ws:/') && !targetUrl.startsWith('ws://')) {
        targetUrl = targetUrl.replace('ws:/', 'ws://');
    }

    let targetWs;
    try {
        targetWs = new WebSocket(targetUrl);
        targetWs.on('error' , (error) =>{
            console.log(error);
        })
    } catch {
        return;
    }
    ws.on('message', (message) => {
          if (Buffer.isBuffer(message)) {
               message = message.toString('utf-8');
          }

            console.log(message)


            const sendWhenReady = () => {
                if (targetWs.readyState === WebSocket.OPEN) {
                    targetWs.send(message);
                } else {
                        //wait 500ms
                    setTimeout(sendWhenReady, 500);
                }
            };

            sendWhenReady();
    });

    targetWs.on('message', (message) => {
          if (Buffer.isBuffer(message)) {
               message = message.toString('utf-8');
          }

          if (ws.readyState === WebSocket.OPEN) {
                console.log(message);
                ws.send(message);
          }
    });
      
    ws.on('close', () => {
            try {
                targetWs.close();
            } catch {
            }
    });

    targetWs.on('close', () => {
            try {
                ws.close();
            } catch {
            }
    });


    
}
