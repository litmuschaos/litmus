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
      groups: [{ assignedAt: 1000, group: 'dev-team', role: 'Owner' }],
      members: [{ invitation: 'Accepted', role: 'Executor', userID: 'user1', username: 'test' }],
      name: 'Test',
      projectID: 'proj1'
    };

    // Individual member role takes priority — no JWT decode needed
    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBe('Executor');
  });

  test('returns group role when user is not an individual member', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedJwtDecode.mockReturnValue({
      exp: 9999999999,
      groups: ['dev-team'],
      role: 'user',
      uid: 'user1',
      username: 'test'
    });

    const project: Project = {
      groups: [{ assignedAt: 1000, group: 'dev-team', role: 'Executor' }],
      members: [{ invitation: 'Accepted', role: 'Owner', userID: 'other-user', username: 'other' }],
      name: 'Test',
      projectID: 'proj1'
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBe('Executor');
  });

  test('returns highest-priority group role when multiple groups match', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedJwtDecode.mockReturnValue({
      exp: 9999999999,
      groups: ['dev-team', 'admin-team'],
      role: 'user',
      uid: 'user1',
      username: 'test'
    });

    const project: Project = {
      groups: [
        { assignedAt: 1000, group: 'dev-team', role: 'Viewer' },
        { assignedAt: 2000, group: 'admin-team', role: 'Owner' },
        { assignedAt: 3000, group: 'qa-team', role: 'Executor' }
      ],
      members: [],
      name: 'Test',
      projectID: 'proj1'
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBe('Owner');
  });

  test('returns undefined when user has no matching membership or group', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedJwtDecode.mockReturnValue({
      exp: 9999999999,
      groups: ['unrelated-group'],
      role: 'user',
      uid: 'user1',
      username: 'test'
    });

    const project: Project = {
      groups: [{ assignedAt: 1000, group: 'dev-team', role: 'Executor' }],
      members: [],
      name: 'Test',
      projectID: 'proj1'
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBeUndefined();
  });

  test('returns undefined when no access token in localStorage', () => {
    const project: Project = {
      groups: [{ assignedAt: 1000, group: 'dev-team', role: 'Executor' }],
      members: [],
      name: 'Test',
      projectID: 'proj1'
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBeUndefined();
  });

  test('returns undefined when project has no groups', () => {
    localStorage.setItem('accessToken', 'fake-token');

    const project: Project = {
      members: [],
      name: 'Test',
      projectID: 'proj1'
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBeUndefined();
  });

  test('returns undefined when JWT has no groups claim', () => {
    localStorage.setItem('accessToken', 'fake-token');
    mockedJwtDecode.mockReturnValue({
      exp: 9999999999,
      role: 'user',
      uid: 'user1',
      username: 'test'
    });

    const project: Project = {
      groups: [{ assignedAt: 1000, group: 'dev-team', role: 'Executor' }],
      members: [],
      name: 'Test',
      projectID: 'proj1'
    };

    const result = getEffectiveProjectRole(project, 'user1');
    expect(result).toBeUndefined();
  });
});
