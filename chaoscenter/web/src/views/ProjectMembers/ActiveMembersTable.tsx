import { Layout, TableV2, Text } from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { GetProjectMembersOkResponse, ProjectMember } from '@api/auth';
import { MemberEmail, MemberName, MemberPermission } from './ActiveMembersListColumns';
import { MenuCell } from './ActiveMemberTableMenu';

interface ActiveMembersTableViewProps {
  activeMembers: ProjectMember[];
  isLoading: boolean;
  getMembersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetProjectMembersOkResponse, unknown>>;
}
export default function ActiveMembersTableView({ activeMembers }: ActiveMembersTableViewProps): React.ReactElement {
  const { getString } = useStrings();
  const envColumns: Column<ProjectMember>[] = useMemo(
    () => [
      {
        Header: 'MEMBERS',
        id: 'username',
        width: '40%',
        accessor: 'username',
        Cell: MemberName
      },
      {
        Header: 'EMAIL',
        id: 'email',
        accessor: 'email',
        width: '30%',
        Cell: MemberEmail
      },
      {
        Header: 'PERMISSIONS',
        id: 'role',
        accessor: 'role',
        width: '30%',
        Cell: MemberPermission
      },
      {
        Header: '',
        id: 'threeDotMenu',
        Cell: ({ row }: { row: Row<ProjectMember> }) => <MenuCell row={{ ...row }} />,
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString]
  );
  return (
    <Layout.Vertical>
      <Text>Total Pending Invitations {activeMembers.length}</Text>
      <TableV2<ProjectMember> columns={envColumns} sortable data={activeMembers} />
    </Layout.Vertical>
  );
}
