import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { useRemoveInvitationMutation } from '@api/auth';
import RemoveMemberView from '@views/RemoveMember';

interface RemoveMemberControllerProps {
  userID: string;
  username: string;
  hideDeleteModal: () => void;
  //   getUsersRefetch: <TPageData>(
  //     options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  //   ) => Promise<QueryObserverResult<Users, unknown>>;
  // }
}
export default function RemoveMemberController(props: RemoveMemberControllerProps): React.ReactElement {
  const { userID, username, hideDeleteModal } = props;
  const { showSuccess } = useToaster();

  const { mutate: removeMemberMutation } = useRemoveInvitationMutation(
    {},
    {
      onSuccess: data => {
        // getUsersRefetch();
        showSuccess(data.message);
      }
    }
  );

  return (
    <RemoveMemberView
      {...props}
      removeMemberMutation={removeMemberMutation}
      userID={userID}
      username={username}
      handleClose={hideDeleteModal}
    />
  );
}
