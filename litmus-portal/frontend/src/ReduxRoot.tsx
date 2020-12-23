import { ApolloProvider } from '@apollo/client';
import * as React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import config from './config';
import App from './containers/app/App';
import configureStore from './redux/configureStore';
import createApolloClient from './utils/createApolloClient';

const { persistor, store } = configureStore();

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
