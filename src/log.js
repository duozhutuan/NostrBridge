const colors = {
    reset: '\x1b[0m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',    // 绿色
    cyan: '\x1b[36m',     // 青色
    magenta: '\x1b[35m',  // 品红
    gray: '\x1b[90m',     // 灰色
};

 
export const log = {
    print: function(color,...message) {
       
        const now = new Date();
        const timestamp = now.toLocaleString();

       
        const formattedMessage = `${colors[color]}[${timestamp}] ${colors.reset}`;

        console.log(`${formattedMessage}`,...message);
    },

    
    blue: function(...message) {
        this.print('blue',...message);
    },

    red: function(...message) {
        this.print('red',...message);
    },

    yellow: function(...message) {
        this.print('yellow',...message);
    },
    cyan:function(...message){
        this.print('cyan',...message);
    },
    magenta:function(...message){
        this.print('magenta',...message);
    },
    green:function(...message){
        this.print('green',...message);
    },
    gray:function(...message){
        this.print('gray',...message);
    },
};

