const webSocketServer = require('ws').Server;

module.exports = (host, port, agentHandler) => {
    const ws_server = new webSocketServer({ host, port });
    ws_server.on('connection', agentHandler);
};
