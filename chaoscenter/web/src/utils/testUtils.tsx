/* eslint-disable no-restricted-imports */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { StringsContext } from '@strings';
import strings from 'strings/strings.en.yaml';
import '../bootstrap.scss';
import { AppStoreContext } from '@context';
import { ReactQueryProvider } from '@api/ReactQueryProvider';

interface TestWrapperProps {
  children: React.ReactElement;
}

export interface APIConfig {
  gqlEndpoints: {
    chaosManagerUri: string;
  };
  restEndpoints: {
    authUri: string;
    chaosManagerUri: string;
  };
}
const NO_OPERATION = 0;

export const findDialogContainer = (): HTMLElement | null => document.querySelector('.bp3-dialog');
export const findPopoverContainer = (): HTMLElement | null => document.querySelector('.bp3-popover-content');

export function TestWrapper({ children }: TestWrapperProps): React.ReactElement {
  const getString = (key: string): string => key;
  const apolloClient = new ApolloClient({ cache: new InMemoryCache() });
  return (
    <AppStoreContext.Provider
      value={{
        projectID: 'litmuschaos-test-project',
        projectRole: 'Owner',
        currentUserInfo: {
          userRole: 'admin',
          ID: 'uid',
          username: 'admin'
        },
        renderUrl: `/account/uid`,
        matchPath: '/account/:accountID',
        updateAppStore: () => void NO_OPERATION
      }}
    >
      <StringsContext.Provider value={{ data: strings as never, getString }}>
        <ReactQueryProvider>
          <ApolloProvider client={apolloClient}>
            <BrowserRouter>{children}</BrowserRouter>
          </ApolloProvider>
        </ReactQueryProvider>
      </StringsContext.Provider>
    </AppStoreContext.Provider>
  );
}
