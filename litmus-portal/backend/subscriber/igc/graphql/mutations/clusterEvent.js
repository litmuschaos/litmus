const appolo = require('apollo-link');
const gql = require('graphql-tag');

const operation = (data) => ({
    query: gql`
		mutation ClusterEvent($data:ClusterEventInput!){
            newClusterEvent(clusterEvent:$data)
        }
	`,
    variables: data,
});

const nextHandler = (ws, data) => {
    console.log(data);
};

const errHandler = (ws, err) => {
    console.log(err);
};

const cmpHandler = () => {
    console.log('EVENT SENT');
};

module.exports = (link, ws, data) => {
    appolo.execute(link, operation(data)).subscribe({
        next: (data) => nextHandler(ws,data),
        error: (err) => errHandler(ws,err),
        complete: () => cmpHandler(ws),
    });
};