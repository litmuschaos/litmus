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
import { getUserDetails } from '@utils';

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
}

function createApolloClient({ config }: LitmusAPIProviderProps): ApolloClient<NormalizedCacheObject> | undefined {
  const { accessToken } = getUserDetails();
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
        authorization: `Bearer ${accessToken}`
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

export const LitmusAPIProvider: React.FC<LitmusAPIProviderProps> = ({ config, children }): React.ReactElement => {
  const apolloClient = createApolloClient({ config });
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

  return (
    <QueryClientProvider client={reactQueryClient}>
      {apolloClient ? <ApolloProvider client={apolloClient}>{children}</ApolloProvider> : children}
    </QueryClientProvider>
  );
};
