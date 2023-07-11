import { TableV2 } from '@harnessio/uicore';
import React from 'react';
import type { InviteUserDetails } from '@controllers/InviteNewMembers/types';

interface InviteUsersTableViewProps {
  hideModal: (value: React.SetStateAction<boolean>) => void;
  data: InviteUserDetails[];
}

export default function InviteUsersTableView({ hideModal, data }: InviteUsersTableViewProps): React.ReactElement {
  console.log('data', data);
  return <TableV2 columns={[]} data={data} />;
}
