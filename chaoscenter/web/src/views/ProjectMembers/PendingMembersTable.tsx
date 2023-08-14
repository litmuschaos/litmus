import { Layout, TableV2, Text } from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { GetProjectMembersOkResponse, ProjectMember } from '@api/auth';
import { InvitationOperation, MemberEmail, MemberName } from './ActiveMembersListColumns';

interface PendingMembersTableViewProps {
  pendingMembers: ProjectMember[];
  isLoading: boolean;
  getPendingMembersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetProjectMembersOkResponse, unknown>>;
}
export default function PendingMembersTableView({ pendingMembers }: PendingMembersTableViewProps): React.ReactElement {
  const { getString } = useStrings();

  const envColumns: Column<ProjectMember>[] = useMemo(
    () => [
      {
        Header: 'MEMBERS',
        id: 'username',
        width: '25%',
        accessor: 'username',
        Cell: MemberName
      },
      {
        Header: 'EMAIL',
        id: 'email',
        accessor: 'email',
        width: '25%',
        Cell: MemberEmail
      },
      {
        Header: 'PERMISSIONS',
        id: 'Role',
        width: '50%',
        Cell: ({ row }: { row: Row<ProjectMember> }) => <InvitationOperation row={row} />,
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString]
  );
  return (
    <Layout.Vertical>
      <Text>Total Pending Invitations {pendingMembers.length}</Text>
      <TableV2<ProjectMember> columns={envColumns} sortable data={pendingMembers} />
    </Layout.Vertical>
  );
}
