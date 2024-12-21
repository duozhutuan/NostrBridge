import { LocalStorage } from 'node-localstorage';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'
import { config } from './config.js';
import { handleHub } from './hub.js'
import { WebSocket } from 'ws';  // 正确的导入方式
import { schnorr } from "@noble/curves/secp256k1";
import { bytesToHex } from "@noble/hashes/utils";

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

//keypriv data fromat:29,99,105,203,87,101,237
if (config.Keypriv){
    Keypriv = config.Keypriv
    const numArray = Keypriv.split(',').map(Number);
    Keypriv = new Uint8Array(numArray)
    Keypub = getPublicKey(Keypriv) // `pk` is a hex string
}

let remoteBridges = [
  'wss://bridge.duozhutuan.com',
//'ws://localhost:8088',
]

console.log("pubkey:",Keypub)

function createConnect(url){
    const ws = new WebSocket(url+"/registerrelay/"+Keypub);

    ws.on('message', (message) => {
        if (Buffer.isBuffer(message)) {
             message = message.toString('utf-8');
        }
        let data = JSON.parse(message)
        if (data.type == "sig"){
            let sig = schnorr.sign(new TextEncoder().encode(data.clientId),Keypriv)
            ws.send(JSON.stringify({"type":'sig',"sig":bytesToHex(sig)}))

        } else if (data.type == "register"){
            console.log(data.message)

        } else if (data.type == "newconnect"){
            const targetWs = new WebSocket(url+"/establishconnection/"+data.clientuid);
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

                console.log(message)
                const sendWhenReady = () => {
                      if (localws.readyState === WebSocket.OPEN) {
                          localws.send(message);
                      } else {
                              //wait 500ms
                          setTimeout(sendWhenReady, 500);
                      }
                  };
      
                  sendWhenReady();
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

    ws.on("close",(message)=>{

        setTimeout(() => createConnect(url), 200);
    })
}

remoteBridges.forEach((url, index) => {
    createConnect(url)
});
