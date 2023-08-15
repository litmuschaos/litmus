import jwtDecode from 'jwt-decode';
import type { DecodedTokenType } from '@models';

interface UserDetailsProps {
  accessToken: string;
  projectRole: string;
  projectID: string;
  accountID: string;
  accountRole: string;
}

export function decode<T = unknown>(arg: string): T {
  return JSON.parse(decodeURIComponent(atob(arg)));
}

export function getUserDetails(): UserDetailsProps {
  const accessToken = localStorage.getItem('accessToken') ?? '';
  const accountID = accessToken ? (jwtDecode(accessToken) as DecodedTokenType).uid : '';
  const accountRole = accessToken ? (jwtDecode(accessToken) as DecodedTokenType).role : '';
  const projectRole = localStorage.getItem('projectRole') ?? '';
  const projectID = localStorage.getItem('projectID') ?? '';
  return { accessToken, projectRole, projectID, accountID, accountRole };
}

export function setUserDetails({
  accessToken,
  projectRole,
  projectID
}: Partial<Omit<UserDetailsProps, 'accountID' | 'accountRole'>>): void {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (projectRole) localStorage.setItem('projectRole', projectRole);
  if (projectID) localStorage.setItem('projectID', projectID);
}
