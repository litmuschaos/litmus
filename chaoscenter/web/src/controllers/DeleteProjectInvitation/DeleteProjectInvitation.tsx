import React from 'react';
import type { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import DeleteProjectInvitationView from '@views/DeleteProjectInvitation';
import { ListInvitationsOkResponse, useDeclineInvitationMutation } from '@api/auth';

interface DeleteProjectInvitationControllerProps {
  handleClose: () => void;
  listInvitationsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListInvitationsOkResponse, unknown>>;
  projectID: string | undefined;
}

export default function DeleteProjectInvitationController(
  props: DeleteProjectInvitationControllerProps
): React.ReactElement {
  const { handleClose, listInvitationsRefetch, projectID } = props;
  const { mutate: declineInvitationMutation } = useDeclineInvitationMutation(
    {},
    { onSuccess: () => listInvitationsRefetch() }
  );

  return (
    <DeleteProjectInvitationView
      declineInvitationMutation={declineInvitationMutation}
      handleClose={handleClose}
      projectID={projectID}
    />
  );
}
