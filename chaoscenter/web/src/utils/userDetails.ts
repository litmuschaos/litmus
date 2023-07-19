interface UserDetails {
  token: string;
  role: string;
  projectID: string;
  accountID: string;
}

export function decode<T = unknown>(arg: string): T {
  return JSON.parse(decodeURIComponent(atob(arg)));
}

export function getUserDetails(): UserDetails {
  const token = localStorage.getItem('token') ?? '';
  const role = localStorage.getItem('role') ?? '';
  const projectID = localStorage.getItem('projectID') ?? '';
  const accountID = localStorage.getItem('accountID') ?? '';
  return { token, role, projectID, accountID };
}

export function setUserDetails({ token, role, projectID, accountID }: UserDetails): void {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('projectID', projectID);
  localStorage.setItem('accountID', accountID);
}
