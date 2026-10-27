import jwtDecode from 'jwt-decode';
import type { DecodedTokenType } from '@models';
import type { Project } from '@api/auth';

export interface UserDetailsProps {
  accessToken: string;
  projectRole: string;
  projectID: string;
  accountID: string;
  accountRole: string;
  isInitialLogin: boolean;
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
  const isInitialLogin = localStorage.getItem('isInitialLogin') === 'true';
  return { accessToken, projectRole, projectID, accountID, accountRole, isInitialLogin };
}

export function setUserDetails({
  accessToken,
  projectRole,
  projectID,
  isInitialLogin
}: Partial<Omit<UserDetailsProps, 'accountID' | 'accountRole'>>): void {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (projectRole !== undefined) localStorage.setItem('projectRole', projectRole || '');
  if (projectID !== null && projectID !== undefined) localStorage.setItem('projectID', projectID);
  if (isInitialLogin !== undefined) localStorage.setItem('isInitialLogin', `${isInitialLogin}`);
}

const rolePriority: Record<string, number> = { Owner: 3, Executor: 2, Viewer: 1 };

export function getEffectiveProjectRole(project: Project, userID?: string): string | undefined {
  // Check individual membership first
  const memberRole = project.members?.find(m => m.userID === userID)?.role;
  if (memberRole) return memberRole;

  // Fall back to group-based role using JWT groups
  const accessToken = localStorage.getItem('accessToken') ?? '';
  if (!accessToken || !project.groups?.length) return undefined;

  const tokenDecode = jwtDecode(accessToken) as DecodedTokenType;
  const userGroups = tokenDecode.groups ?? [];
  if (!userGroups.length) return undefined;

  // Find highest-privilege matching group role
  let bestRole: string | undefined;
  let bestPriority = 0;
  for (const g of project.groups) {
    if (userGroups.includes(g.group) && (rolePriority[g.role] ?? 0) > bestPriority) {
      bestPriority = rolePriority[g.role] ?? 0;
      bestRole = g.role;
    }
  }
  return bestRole;
}
