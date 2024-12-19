import { LocalStorage } from 'node-localstorage';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'
import { config } from './config.js';
import { handleHub } from './hub.js'
import { WebSocket } from 'ws';  // 正确的导入方式

const localStorage = new LocalStorage('.data');

export let Keypub;
export let Keypriv = localStorage.getItem('Keypriv');
if (Keypriv === null){
    Keypriv = generateSecretKey() // `sk` is a Uint8Array
    Keypub = getPublicKey(Keypriv) // `pk` is a hex string
    localStorage.setItem('Keypriv', Keypriv);
} else {
    const numArray = Keypriv.split(',').map(Number);
    Keypriv = new Uint8Array(numArray)
    Keypub = getPublicKey(Keypriv) // `pk` is a hex string
}

if (config.pubkey){
    Keypub = config.pubkey
}

remoteBridges = [
'wss://bridge.duozhutuan.com',

]

remoteBridges.forEach((url, index) => {
    const ws = new WebSocket(url+"registerrelay/"+KeyPub);

    ws.on('message', (message) => {
        if (Buffer.isBuffer(message)) {
             message = message.toString('utf-8');
        }
        let data = JSON.parse(message)
        if (data.type == "newconnect"){
            const targetWs = new WebSocket(url+"establishconnection/"+data.clientuid);
            const localws  = new WebSocket(config.localserver)    
            localws.on('message', (message) => {
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
                      localws.send(message);
                }
          });
            
          localws.on('close', () => {
                  try {
                      targetWs.close();
                  } catch {
                  }
          });
      
          targetWs.on('close', () => {
                  try {
                    localws.close();
                  } catch {
                  }
          });
        }
            
    })

});
