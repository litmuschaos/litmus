// This Component will work as a Provider Wrapper for the component to be tested.

import React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from '../redux/configureStore';
import ThemeWrapper from './ThemeWrapper';

interface ProviderWrapperProps {
  children?: React.ReactNode;
}

const { store } = configureStore();

const client = new ApolloClient({
  cache: new InMemoryCache(),
});

const ProviderWrapper: React.FC<ProviderWrapperProps> = ({ children }) => {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <ThemeWrapper>
          <BrowserRouter>{children}</BrowserRouter>
        </ThemeWrapper>
      </Provider>
    </ApolloProvider>
  );
};

export default ProviderWrapper;
