
// a simple relay server for cache message

let SubMaps = new Map();
let EventMaps = new Map();
 

setInterval(() => {
  const timestampInSeconds = Math.floor(Date.now() / 1000);

  // 清理过期的订阅
  for (const [key, sub] of SubMaps.entries()) {
    if (timestampInSeconds - sub.timestamp > 600) {
      if (sub.cr && sub.cr._ws) {
        sub.cr.send(['EOSE', sub.subId]);
      }
      SubMaps.delete(key);
    }
  }

  // 清理过期的事件
  for (const [key, event] of EventMaps.entries()) {
    if (timestampInSeconds - event.timestamp > 600) {
      EventMaps.delete(key);
    }
  }
}, 2000);


function matchFilter(filter, event) {
  if (filter['#e']) {
    // 检查事件的 tags 中是否有与 filter['#e'] 匹配的 #e 标签
    const hasMatchingETag = event.tags.some(
      tag => tag[0] === 'e' && filter['#e'].includes(tag[1])
    );
    if (hasMatchingETag) {
      return true;
    }
  }

  return false;
}

export class cacheRelay {
  constructor(ws) {
    this._ws = ws; // 使用 ws 代替 socket，更符合 WebSocket 的命名习惯
     
    this.connect_timestamp  = Math.floor(Date.now() / 1000);
    ws.on("message",(message) => this.handle(message))
    // close after 5 minutes
    setTimeout(this.cleanup, 5000 * 60);
  }

  
  cleanup() {
    this._ws.close(); // 修改为 this._ws
    this._ws = null;
 
  }
 

 
  send(message) {
    this._ws.send(JSON.stringify(message)); // 修改为 this._ws
  }

  handle(message) {
    if (Buffer.isBuffer(message)) {
        message = message.toString('utf-8');
    }

    console.log(message)
    try {
      message = JSON.parse(message);
    } catch (e) {
      this.send(['NOTICE', '', 'Unable to parse message']);
    }

    let verb, payload;
    try {
      [verb, ...payload] = message;
    } catch (e) {
      this.send(['NOTICE', '', 'Unable to read message']);
    }
    const handler = this[`on${verb}`];

    if (handler) {
      handler.call(this, ...payload);
    } else {
      this.send(['NOTICE', '', 'Unable to handle message']);
    }
  }

  onCLOSE(subId) {
    
  }

  onREQ(subId, ...filters) {
    //console.log('REQ', subId, ...filters);

    // 先检查 EventMaps 是否有匹配的事件
    let hasMatch = false;
    for (const [eventId, event] of EventMaps.entries()) {
      for (const filter of filters) {
        if (matchFilter(filter, event)) {
          this.send(['EVENT', subId, event]);
          hasMatch = true;
        }
      }
    }

    // 如果没有匹配的事件，将订阅存储到 SubMaps
    if (!hasMatch) {
       
      SubMaps.set(subId, {
        subId,
        filters,
        cr: this, // 当前 cacheRelay 实例
        timestamp: Math.floor(Date.now() / 1000),
      });
    }

    console.log('EOSE');

    this.send(['EOSE', subId]);
  }

  onEVENT(event) {
    EventMaps.set(event.id, {
      ...event,
      timestamp: Math.floor(Date.now() / 1000),
    });
  
    //console.log('EVENT', event, true);
  
    // 发送 OK 响应
    this.send(['OK', event.id, true, '']);
  
    // 检查 SubMaps 是否有匹配的订阅
    for (const [subId, sub] of SubMaps.entries()) {
      for (const filter of sub.filters) {
        if (matchFilter(filter, event)) {
          console.log('match', subId, event);
          sub.cr.send(['EVENT', subId, event]);
        }
      }
    }

  } //onEVENT
}
