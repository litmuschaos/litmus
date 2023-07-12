import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, ButtonVariation, Layout } from '@harnessio/uicore';
import { getUsersForInvitation } from '@api/core/projects/inviteUsers';
import InviteUsersTableView from '@views/InviteNewMembers';
import { useStrings } from '@strings';
import { generateInviteUsersTableContent } from './helper';
import type { InviteUserDetails } from './types';

interface InviteUsersControllerProps {
  hideDarkModal: (value: React.SetStateAction<boolean>) => void;
}

export default function InviteUsersController({ hideDarkModal }: InviteUsersControllerProps): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const [users, setUsers] = React.useState<InviteUserDetails[]>([]);
  const { data } = getUsersForInvitation(projectID);
  const { getString } = useStrings();
  React.useEffect(() => {
    data && setUsers(generateInviteUsersTableContent(data));
  }, [data]);

  return (
    <Layout.Vertical>
      <InviteUsersTableView data={users} />
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
