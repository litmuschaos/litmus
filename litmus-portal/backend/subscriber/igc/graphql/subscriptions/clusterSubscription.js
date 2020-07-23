const appolo = require('apollo-link');
const gql = require('graphql-tag');

const operation = (data) => ({
    query: gql`
		subscription hello($data:ClusterIdentity!){
          clusterConnect(clusterInfo:$data){
            project_id
            action
          }
        }
	`,
    variables: data,
});

const nextHandler = (ws, response) => {
    console.log(JSON.parse(response.data.clusterSubscription.action));
    ws.send(response.data.clusterSubscription.action);
};

const errHandler = (ws, err) => {
    console.log(err);
    ws.send(JSON.stringify({ type: 'error', data: 'Error' }));
};

module.exports = (link, ws, data) => {
    appolo.execute(link, operation(data)).subscribe({
        next: (response) => nextHandler(ws, response),
        error: (err) => errHandler(ws, err),
        complete: () => console.log("done"),
    });
};
