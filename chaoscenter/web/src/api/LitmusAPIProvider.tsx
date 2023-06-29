import React from 'react';
import axios from 'axios';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  Operation,
  RequestHandler,
  split
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

export interface APIConfig {
  gqlEndpoints: {
    chaosManagerUri: string;
    sockURL: string;
  };
  restEndpoints: {
    authUri: string;
    ngPlatformUri: string;
    ngLoggingUri: string;
    chaosManagerUri: string;
  };
}

interface LitmusAPIProviderProps {
  config: APIConfig;
  token: string;
}

function createApolloClient({
  config,
  token
}: LitmusAPIProviderProps): ApolloClient<NormalizedCacheObject> | undefined {
  if (!config.gqlEndpoints) return undefined;

  const httpLinkUri = config.gqlEndpoints.chaosManagerUri;
  const wsLinkUri = config.gqlEndpoints.sockURL;

  if (!httpLinkUri && !wsLinkUri) return undefined;

  let httpLink: HttpLink | null = null;
  if (httpLinkUri) {
    httpLink = new HttpLink({
      uri: httpLinkUri
    });
  }

  let wsLink: WebSocketLink | null = null;
  if (wsLinkUri) {
    wsLink = new WebSocketLink({
      uri: wsLinkUri,
      options: {
        reconnect: true,
        timeout: 30000
      }
    });
  }

  const authLink = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: token
      }
    }));

    return forward(operation);
  });

  const links: (ApolloLink | RequestHandler)[] = [authLink];

  // The split function takes three parameters:
  //
  // * A function that's called for each operation to execute
  // * The Link to use for an operation if the function returns a "truthy" value
  // * The Link to use for an operation if the function returns a "falsy" value
  const splitOperation = ({ query }: Operation): boolean => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  };

  if (httpLink && !wsLink) {
    links.push(httpLink);
  } else if (!httpLink && wsLink) {
    const splitLink = split(splitOperation, wsLink);
    links.push(splitLink);
  } else if (httpLink && wsLink) {
    const splitLink = split(splitOperation, wsLink, httpLink);
    links.push(splitLink);
  }

  const client = new ApolloClient({
    link: from(links),
    cache: new InMemoryCache()
  });

  return client;
}

export const LitmusAPIProvider: React.FC<LitmusAPIProviderProps> = ({
  config,
  token,
  children
}): React.ReactElement => {
  if (config.restEndpoints) {
    axios.defaults.baseURL = config.restEndpoints.ngPlatformUri;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // const scope = getScope();
  const apolloClient = createApolloClient({ config, token });

  return apolloClient ? <ApolloProvider client={apolloClient}>{children}</ApolloProvider> : <></>;
};
