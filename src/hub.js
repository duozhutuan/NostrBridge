
// Forward WebSocket connections to another relay server

export function handleHub(ws,req){

    const parsedUrl = parse(req.url, true);
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
