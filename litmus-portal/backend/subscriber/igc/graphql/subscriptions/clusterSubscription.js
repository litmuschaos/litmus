const appolo = require('apollo-link');
const gql = require('graphql-tag');

const operation = () => ({
    query: gql`
		subscription {
			clusterSubscription {
				id
				data
			}
		}
	`,
});

const nextHandler = (ws, response) => {
    console.log(JSON.parse(response.data.clusterSubscription.data));
    ws.send(response.data.clusterSubscription.data);
};

const errHandler = (ws, err) => {
    console.log(err);
    ws.send(JSON.stringify({ type: 'error', data: 'Error' }));
};

module.exports = (link, ws) => {
    appolo.execute(link, operation()).subscribe({
        next: (response) => nextHandler(ws, response),
        error: (err) => errHandler(ws, err),
        complete: () => console.log("done"),
    });
};
