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
    ws.on('message', (data) => {
        console.log(data)
    });
};

server('0.0.0.0', '8000', agentHandler);
