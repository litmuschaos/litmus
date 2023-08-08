import React from 'react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  RequestHandler
} from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface APIConfig {
  gqlEndpoints: {
    chaosManagerUri: string;
  };
  restEndpoints: {
    authUri: string;
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

  if (!httpLinkUri) return undefined;

  let httpLink: HttpLink | null = null;
  httpLink = new HttpLink({
    uri: httpLinkUri
  });

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
  links.push(httpLink);

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
  const apolloClient = createApolloClient({ config, token });
  const reactQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: false
      }
    }
  });

  return apolloClient ? (
    <QueryClientProvider client={reactQueryClient}>
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </QueryClientProvider>
  ) : (
    <></>
  );
};
