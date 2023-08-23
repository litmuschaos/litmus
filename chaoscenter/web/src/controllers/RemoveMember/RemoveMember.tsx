import React from 'react';
import { useToaster } from '@harnessio/uicore';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { GetProjectMembersOkResponse, useRemoveInvitationMutation } from '@api/auth';
import RemoveMemberView from '@views/RemoveMember';

interface RemoveMemberControllerProps {
  userID: string;
  username: string;
  hideDeleteModal: () => void;
  getMembersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetProjectMembersOkResponse, unknown>>;
}
export default function RemoveMemberController(props: RemoveMemberControllerProps): React.ReactElement {
  const { userID, username, hideDeleteModal, getMembersRefetch } = props;
  const { showSuccess } = useToaster();

  const { mutate: removeMemberMutation } = useRemoveInvitationMutation(
    {},
    {
      onSuccess: data => {
        getMembersRefetch();
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
