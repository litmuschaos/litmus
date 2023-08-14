import { TableV2 } from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import type { InviteUserDetails } from '@controllers/InviteNewMembers/types';
import { useStrings } from '@strings';
import type { GetUsersForInvitationOkResponse } from '@api/auth';
import { MenuCell, UserEmail, UserName } from './InviteNewMemberListColumns';

interface InviteUsersTableViewProps {
  data: InviteUserDetails[];
  getUsers: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetUsersForInvitationOkResponse, unknown>>;
}

export default function InviteUsersTableView({ data, getUsers }: InviteUsersTableViewProps): React.ReactElement {
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
      },
      {
        Header: '',
        id: 'threeDotMenu',
        Cell: ({ row }: { row: Row<InviteUserDetails> }, getUsersRefetch = { getUsers }) => (
          <MenuCell row={{ ...row }} /> // TODO add refetch
        ),
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString]
  );
  return <TableV2 columns={envColumns} data={data} />;
}
