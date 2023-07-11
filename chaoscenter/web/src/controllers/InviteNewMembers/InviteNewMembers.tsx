import React from 'react';
import { useParams } from 'react-router-dom';
import { getUsersForInvitation } from '@api/core/projects/inviteUsers';
import InviteUsersTableView from '@views/InviteNewMembers';
import { generateInviteUsersTableContent } from './helper';
import type { InviteUserDetails } from './types';

interface InviteUsersControllerProps {
  hideDarkModal: (value: React.SetStateAction<boolean>) => void;
}

export default function InviteUsersController({ hideDarkModal }: InviteUsersControllerProps): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const [users, setUsers] = React.useState<InviteUserDetails[]>([]);
  const { data } = getUsersForInvitation(projectID);
  console.log('inivte', data);

  React.useEffect(() => {
    data && setUsers(generateInviteUsersTableContent(data));
  }, [data]);

  return <InviteUsersTableView hideModal={hideDarkModal} data={users} />;
}
