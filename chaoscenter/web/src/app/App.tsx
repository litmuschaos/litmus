import React from 'react';
import { StringsContext } from 'strings';
import { LitmusAPIProvider } from '@api/LitmusAPIProvider';
import { RoutesWithAuthentication, RoutesWithoutAuthentication } from '@routes/RouteDestinations';
import strings from 'strings/strings.en.yaml';
import APIEndpoints from '@config';
import type { StringsMap } from 'strings/types';
import { AppStoreProvider } from '@context';

export function AppWithAuthentication(): React.ReactElement {
  return (
    <AppStoreProvider updateAppStore={() => void 0}>
      <StringsContext.Provider value={{ data: strings as StringsMap }}>
        <LitmusAPIProvider config={APIEndpoints}>
          <RoutesWithAuthentication />
        </LitmusAPIProvider>
      </StringsContext.Provider>
    </AppStoreProvider>
  );
}

export function AppWithoutAuthentication(): React.ReactElement {
  return (
    <StringsContext.Provider value={{ data: strings as StringsMap }}>
      <LitmusAPIProvider config={APIEndpoints}>
        <RoutesWithoutAuthentication />
      </LitmusAPIProvider>
    </StringsContext.Provider>
  );
}
