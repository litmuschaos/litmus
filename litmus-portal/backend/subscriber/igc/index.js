const { clusterSubscription } = require('./graphql/subscriptions');
const ws = require('ws');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const server = require('./agentServer');

const gqlServer = `ws://${process.env.GQL_SERVER}`;
console.log(gqlServer);

const client = new SubscriptionClient(
    gqlServer,
    {
        reconnect: true,
    },
    ws
);
const link = new WebSocketLink(client);

const agentHandler = (ws) => {
    clusterSubscription(link, ws);

    // message received from the client
    ws.on('message', (data) => {
        console.log(JSON.parse(data))
    });

    // websocket error event
    ws.on('error', (err) => {
        console.log('Error : '+ err)
    })

    // websocket close event
    ws.on('close', () => {
        console.log('Agent disconnected')
    })
};

server('0.0.0.0', '8000', agentHandler);
