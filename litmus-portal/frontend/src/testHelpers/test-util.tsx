import { render, RenderOptions } from '@testing-library/react';
import { LitmusThemeProvider } from 'litmus-ui';
import React, { ReactElement, FC } from 'react';
import { ApolloProvider } from '@apollo/client';
import { Provider } from 'react-redux';
import config from '../config';
import configureStore from '../redux/configureStore';
import createApolloClient from '../utils/createApolloClient';

const { store } = configureStore();

const client = createApolloClient(
  `${config.grahqlEndpoint}/query`,
  `${config.grahqlEndpointSubscription}/query`
);

const Wrapper: React.FC = ({ children }) => {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <LitmusThemeProvider>{children}</LitmusThemeProvider>
      </Provider>
    </ApolloProvider>
  );
};

const UIRenderer = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: Wrapper, ...options });

export { UIRenderer as render };
