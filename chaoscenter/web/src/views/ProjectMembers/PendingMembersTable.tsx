import { TableV2 } from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import { useStrings } from '@strings';
import type { ProjectMember } from '@controllers/ActiveProjectMemberList/types';
import { InvitationOperation, MemberEmail, MemberName } from './ActiveMembersListColumns';

interface PendingMembersTableViewProps {
  activeMembers: ProjectMember[];
}
export default function PendingMembersTableView({ activeMembers }: PendingMembersTableViewProps): React.ReactElement {
  const { getString } = useStrings();

  const envColumns: Column<ProjectMember>[] = useMemo(
    () => [
      {
        Header: 'MEMBERS',
        id: 'Username',
        width: '25%',
        accessor: 'Username',
        Cell: MemberName
      },
      {
        Header: 'EMAIL',
        id: 'Email',
        accessor: 'Email',
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
  return <TableV2<ProjectMember> columns={envColumns} sortable data={activeMembers} />;
}
