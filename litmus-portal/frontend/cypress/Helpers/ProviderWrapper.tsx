//This Component will work as a Provider Wrapper for the component.

import React from 'react';
import ThemeWrapper from './ThemeWrapper';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { Provider } from 'react-redux';
import configureStore from '../../src/redux/configureStore';

interface ProviderWrapperProps {
  children?: React.ReactNode;
}

const { store } = configureStore();

const client = new ApolloClient({
  cache: new InMemoryCache(),
});

const ProviderWrapper: React.FC<ProviderWrapperProps> = ({
  children,
}) => {

  return (
        <ApolloProvider client={client}>
            <Provider store={store}>
                <ThemeWrapper >
                    {children}
                </ThemeWrapper>
            </Provider>
        </ApolloProvider>
  );
};

export default ProviderWrapper;