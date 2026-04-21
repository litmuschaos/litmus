import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { GroupMember } from '@api/auth';
import { TestWrapper } from 'utils/testUtils';
import GroupsTableView from '../GroupsTable';

describe('GroupsTableView', () => {
  const mockRefetch = jest.fn();

  test('renders group members with name, role, and date', () => {
    const groups: GroupMember[] = [
      { group: 'dev-team-guid', displayName: 'Dev Team', role: 'Executor', assignedAt: 1713700000000 },
      { group: 'qa-team-guid', role: 'Viewer', assignedAt: 1713700000000 }
    ];

    render(
      <TestWrapper>
        <GroupsTableView groups={groups} isLoading={false} getGroupsRefetch={mockRefetch} />
      </TestWrapper>
    );

    // Check displayName is rendered when available
    expect(screen.getByText('Dev Team')).toBeInTheDocument();
    // Check group GUID is shown as subtitle when displayName exists
    expect(screen.getByText('dev-team-guid')).toBeInTheDocument();

    // Check group without displayName shows group ID directly
    expect(screen.getByText('qa-team-guid')).toBeInTheDocument();

    // Check roles
    expect(screen.getByText('Executor')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();

    // Check group count header
    expect(screen.getByText('groupMembers: 2')).toBeInTheDocument();
  });

  test('renders empty state when no groups', () => {
    render(
      <TestWrapper>
        <GroupsTableView groups={[]} isLoading={false} getGroupsRefetch={mockRefetch} />
      </TestWrapper>
    );

    expect(screen.getByText('noGroupsTitle')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(
      <TestWrapper>
        <GroupsTableView groups={undefined} isLoading={true} getGroupsRefetch={mockRefetch} />
      </TestWrapper>
    );

    // Count header shows 0 while loading
    expect(screen.getByText('groupMembers: 0')).toBeInTheDocument();
  });
});
