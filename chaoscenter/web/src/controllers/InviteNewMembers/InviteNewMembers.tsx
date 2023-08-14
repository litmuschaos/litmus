import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, ButtonVariation, Layout } from '@harnessio/uicore';
import { getUsersForInvitation } from '@api/core/projects/inviteUsers';
import InviteUsersTableView from '@views/InviteNewMembers';
import { useStrings } from '@strings';
import { useGetUsersForInvitationQuery } from '@api/auth';
import { generateInviteUsersTableContent } from './helper';
import type { InviteUserDetails } from './types';

interface InviteUsersControllerProps {
  hideDarkModal: (value: React.SetStateAction<boolean>) => void;
}

export default function InviteUsersController({ hideDarkModal }: InviteUsersControllerProps): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const [users, setUsers] = React.useState<InviteUserDetails[]>([]);
  const { data, isLoading, refetch: getUsers } = useGetUsersForInvitationQuery({ project_id: projectID });
  const { getString } = useStrings();
  React.useEffect(() => {
    if (isLoading === false && data?.data) setUsers(generateInviteUsersTableContent(data.data));
  }, [data, isLoading]);
  return (
    <Layout.Vertical>
      <InviteUsersTableView data={users} getUsers={getUsers} />
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'medium'}>
        <Button
          disabled={false}
          onClick={() => hideDarkModal(true)}
          variation={ButtonVariation.SECONDARY}
          text={getString('cancel')}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}
