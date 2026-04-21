import jwtDecode from 'jwt-decode';
import { getEffectiveProjectRole } from '@utils';
import type { Project } from '@api/auth';

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn()
}));
const mockedJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

describe('getEffectiveProjectRole', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedJwtDecode.mockReset();
  });

  test('returns individual member role when user is a member', () => {
    const project: Project = {
      projectID: 'proj1',
      name: 'Test',
      members: [{ userID: 'user1', username: 'test', role: 'Executor', invitation: 'Accepted' }],
      groups: [{ group: 'dev-team', role: 'Owner', assignedAt: 1000 }]
    };

    // Individual member role takes priority — no JWT decode needed
    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBe('Executor');
  });

  test('returns group role when user is not an individual member', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedJwtDecode.mockReturnValue({
      uid: 'user1',
      username: 'test',
      role: 'user',
      exp: 9999999999,
      groups: ['dev-team']
    });

    const project: Project = {
      projectID: 'proj1',
      name: 'Test',
      members: [{ userID: 'other-user', username: 'other', role: 'Owner', invitation: 'Accepted' }],
      groups: [{ group: 'dev-team', role: 'Executor', assignedAt: 1000 }]
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBe('Executor');
  });

  test('returns highest-priority group role when multiple groups match', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedJwtDecode.mockReturnValue({
      uid: 'user1',
      username: 'test',
      role: 'user',
      exp: 9999999999,
      groups: ['dev-team', 'admin-team']
    });

    const project: Project = {
      projectID: 'proj1',
      name: 'Test',
      members: [],
      groups: [
        { group: 'dev-team', role: 'Viewer', assignedAt: 1000 },
        { group: 'admin-team', role: 'Owner', assignedAt: 2000 },
        { group: 'qa-team', role: 'Executor', assignedAt: 3000 }
      ]
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBe('Owner');
  });

  test('returns undefined when user has no matching membership or group', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedJwtDecode.mockReturnValue({
      uid: 'user1',
      username: 'test',
      role: 'user',
      exp: 9999999999,
      groups: ['unrelated-group']
    });

    const project: Project = {
      projectID: 'proj1',
      name: 'Test',
      members: [],
      groups: [{ group: 'dev-team', role: 'Executor', assignedAt: 1000 }]
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBeUndefined();
  });

  test('returns undefined when no access token in localStorage', () => {
    const project: Project = {
      projectID: 'proj1',
      name: 'Test',
      members: [],
      groups: [{ group: 'dev-team', role: 'Executor', assignedAt: 1000 }]
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBeUndefined();
  });

  test('returns undefined when project has no groups', () => {
    localStorage.setItem('accessToken', 'fake-token');

    const project: Project = {
      projectID: 'proj1',
      name: 'Test',
      members: []
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBeUndefined();
  });

  test('returns undefined when JWT has no groups claim', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedJwtDecode.mockReturnValue({
      uid: 'user1',
      username: 'test',
      role: 'user',
      exp: 9999999999
    });

    const project: Project = {
      projectID: 'proj1',
      name: 'Test',
      members: [],
      groups: [{ group: 'dev-team', role: 'Executor', assignedAt: 1000 }]
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBeUndefined();
  });
});
