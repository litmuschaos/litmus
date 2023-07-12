import { TableV2 } from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column } from 'react-table';
import type { InviteUserDetails } from '@controllers/InviteNewMembers/types';
import { useStrings } from '@strings';
import { UserEmail, UserName } from './InviteNewMemberListColumns';

interface InviteUsersTableViewProps {
  data: InviteUserDetails[];
}

export default function InviteUsersTableView({ data }: InviteUsersTableViewProps): React.ReactElement {
  const { getString } = useStrings();
  const envColumns: Column<InviteUserDetails>[] = useMemo(
    () => [
      {
        Header: 'MEMBERS',
        id: 'Username',
        width: '40%',
        accessor: 'Username',
        Cell: UserName
      },
      {
        Header: 'EMAIL',
        id: 'Email',
        accessor: 'Email',
        width: '30%',
        Cell: UserEmail
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString]
  );
  return <TableV2 columns={envColumns} data={data} />;
}
