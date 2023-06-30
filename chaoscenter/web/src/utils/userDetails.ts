interface UserDetails {
  token: string;
  role: string;
  projectID: string;
}

export function decode<T = unknown>(arg: string): T {
  return JSON.parse(decodeURIComponent(atob(arg)));
}

export function getUserDetails(): UserDetails {
  const token = localStorage.getItem('token') ?? '';
  const role = localStorage.getItem('role') ?? '';
  const projectID = localStorage.getItem('projectID') ?? '';
  return { token, role, projectID };
}

export function setUserDetails({ token, role, projectID }: UserDetails): void {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('projectID', projectID);
}
