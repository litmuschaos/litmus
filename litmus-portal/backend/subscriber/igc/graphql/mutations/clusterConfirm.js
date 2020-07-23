const appolo = require('apollo-link');
const gql = require('graphql-tag');

const operation = (data) => ({
    query: gql`
		mutation($data: ClusterIdentity!) {
			clusterConfirm(identity: $data)
		}
	`,
    variables: data,
});

const nextHandler = (ws, response) => {
    console.log(response);
    return response.data.clusterConfirm
};

const cmpHandler = () => {
    console.log('Done');
};

module.exports = (link, ws, data) => {
    return new Promise((resolve, reject) => {
        appolo.execute(link, operation(data)).subscribe({
            next: (data) => {
                resolve(nextHandler(ws,data))
            },
            error: (err) => {
                reject(err)
            },
            complete: () => cmpHandler(ws),
        });
    });
};