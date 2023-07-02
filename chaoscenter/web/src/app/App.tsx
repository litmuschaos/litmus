import React from 'react';
import jwtDecode from 'jwt-decode';
import { StringsContext } from 'strings';
import { LitmusAPIProvider } from '@api/LitmusAPIProvider';
import { RoutesWithAuthentication, RoutesWithoutAuthentication } from '@routes/RouteDestinations';
import strings from 'strings/strings.en.yaml';
import APIEndpoints from '@config';
import { getUserDetails } from '@utils';
import type { StringsMap } from 'strings/types';
import { useLogout } from '@hooks';
import { AppStoreProvider } from '@context';
interface DecodedTokenType {
  exp: number;
  role: string;
  uid: string;
  username: string;
}

export function AppWithAuthentication(): React.ReactElement {
  const userDetails = getUserDetails();
  const { forceLogout } = useLogout();
  try {
    const tokenDecode: DecodedTokenType = jwtDecode(userDetails.token);
    return (
      <AppStoreProvider
        projectID={userDetails.projectID}
        projectRole={tokenDecode.role}
        currentUserInfo={{
          ID: tokenDecode.uid,
          username: tokenDecode.username,
          userRole: tokenDecode.role
        }}
        renderUrl={`/project/${userDetails.projectID}`}
        matchPath={'/project/:projectID'}
        updateAppStore={() => void 0}
      >
        <StringsContext.Provider value={{ data: strings as StringsMap }}>
          <LitmusAPIProvider config={APIEndpoints} token={userDetails.token}>
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
      <LitmusAPIProvider config={APIEndpoints} token={userDetails.token}>
        <RoutesWithoutAuthentication />
      </LitmusAPIProvider>
    </StringsContext.Provider>
  );
}
