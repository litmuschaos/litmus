const { clusterSubscription } = require('./graphql/subscriptions');
const { clusterConfirm,clusterEvent } = require('./graphql/mutations');
const ws = require('ws');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const server = require('./agentServer');

const gqlServer = `ws://${process.env.GQL_SERVER}`;
const cid = process.env.CID
let key = process.env.KEY
console.log(gqlServer);

const client = new SubscriptionClient(
    gqlServer,
    {
        reconnect: true,
    },
    ws
);
const agentHandler = (ws) => {
    const link = new WebSocketLink(client);
    clusterConfirm(link,ws,{data:{cluster_id: cid, access_key:key}}).then(newKey=>{
        key=newKey
        console.log(key)
        clusterSubscription(link, ws,{data:{cluster_id: cid, access_key:key}});
        // message received from the client
        ws.on('message', (data) => {
            console.log(JSON.parse(data))
            clusterEvent(link,ws,{data:{name: "EVENT FROM AGENT", description: data, cluster_id: cid, access_key:key}})
        });

        // websocket error event
        ws.on('error', (err) => {
            console.log('Error : '+ err)
        })

        // websocket close event
        ws.on('close', () => {
            console.log('Agent disconnected')
        })
    })
};

server('0.0.0.0', '8000', agentHandler);
