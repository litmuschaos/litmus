import { TableV2 } from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import type { ProjectMember } from '@controllers/ActiveProjectMembers/types';
import { useStrings } from '@strings';
import { MemberEmail, MemberName, MemberPermission } from './ActiveMembersListColumns';
import { MenuCell } from './ActiveMemberTableMenu';

interface ActiveMembersTableViewProps {
  activeMembers: ProjectMember[];
}
export default function ActiveMembersTableView({ activeMembers }: ActiveMembersTableViewProps): React.ReactElement {
  const { getString } = useStrings();
  const envColumns: Column<ProjectMember>[] = useMemo(
    () => [
      {
        Header: 'MEMBERS',
        id: 'Username',
        width: '40%',
        accessor: 'Username',
        Cell: MemberName
      },
      {
        Header: 'EMAIL',
        id: 'Email',
        accessor: 'Email',
        width: '30%',
        Cell: MemberEmail
      },
      {
        Header: 'PERMISSIONS',
        id: 'Role',
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
  return <TableV2<ProjectMember> columns={envColumns} sortable data={activeMembers} />;
}
