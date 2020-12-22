import { ApolloProvider } from '@apollo/client';
import * as React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import config from './config';
import App from './containers/app/App';
import configureStore from './redux/configureStore';
import createApolloClient from './utils/createApolloClient';

const { persistor, store } = configureStore();

// const httpLink = new HttpLink({
//   uri: `${config.grahqlEndpoint}/query`,
// });
// const authLink = setContext((_, { headers }) => {
//   const token = getToken();
//   return {
//     headers: {
//       ...headers,
//       authorization: token,
//     },
//   };
// });
// const wsLink = new WebSocketLink({
//   uri: `${config.grahqlEndpointSubscription}/query`,
//   options: {
//     reconnect: true,
//     lazy: true,
//   },
// });

// const link = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   authLink.concat(wsLink),
//   authLink.concat(httpLink)
// );

// export const client = new ApolloClient({
//   link,
//   cache: new InMemoryCache(),
// });
const client = createApolloClient(
  `${config.grahqlEndpoint}/query`,
  `${config.grahqlEndpointSubscription}/query`
);

const ReduxRoot = () => {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ApolloProvider>
  );
};

export default ReduxRoot;
