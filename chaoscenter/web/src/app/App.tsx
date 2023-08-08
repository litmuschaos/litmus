import React from 'react';
import { StringsContext } from 'strings';
import { LitmusAPIProvider } from '@api/LitmusAPIProvider';
import { RoutesWithAuthentication, RoutesWithoutAuthentication } from '@routes/RouteDestinations';
import strings from 'strings/strings.en.yaml';
import APIEndpoints from '@config';
import { getUserDetails } from '@utils';
import type { StringsMap } from 'strings/types';
import { useLogout } from '@hooks';
import { AppStoreProvider } from '@context';

export function AppWithAuthentication(): React.ReactElement {
  const userDetails = getUserDetails();
  const { forceLogout } = useLogout();
  try {
    return (
      <AppStoreProvider>
        <StringsContext.Provider value={{ data: strings as StringsMap }}>
          <LitmusAPIProvider config={APIEndpoints} token={userDetails.accessToken}>
            <RoutesWithAuthentication />
          </LitmusAPIProvider>
        </StringsContext.Provider>
      </AppStoreProvider>
    );
  } catch {
    forceLogout();
    return <></>;
  }
}

export function AppWithoutAuthentication(): React.ReactElement {
  const userDetails = getUserDetails();
  return (
    <StringsContext.Provider value={{ data: strings as StringsMap }}>
      <LitmusAPIProvider config={APIEndpoints} token={userDetails.accessToken}>
        <RoutesWithoutAuthentication />
      </LitmusAPIProvider>
    </StringsContext.Provider>
  );
}
