interface GetUserDetailsProps {
  token: string;
  projectRole: string;
  projectID: string;
  accountID: string;
  accountRole: string;
}
interface SetUserDetailsProps {
  token?: string;
  projectRole?: string;
  projectID?: string;
  accountID?: string;
  accountRole?: string;
}

export function decode<T = unknown>(arg: string): T {
  return JSON.parse(decodeURIComponent(atob(arg)));
}

export function getUserDetails(): GetUserDetailsProps {
  const token = localStorage.getItem('token') ?? '';
  const projectRole = localStorage.getItem('projectRole') ?? '';
  const projectID = localStorage.getItem('projectID') ?? '';
  const accountID = localStorage.getItem('accountID') ?? '';
  const accountRole = localStorage.getItem('accountRole') ?? '';
  return { token, projectRole, projectID, accountID, accountRole };
}

export function setUserDetails({ token, projectRole, projectID, accountID, accountRole }: SetUserDetailsProps): void {
  if (token) localStorage.setItem('token', token);
  if (projectRole) localStorage.setItem('projectRole', projectRole);
  if (projectID) localStorage.setItem('projectID', projectID);
  if (accountID) localStorage.setItem('accountID', accountID);
  if (accountRole) localStorage.setItem('accountRole', accountRole);
}
