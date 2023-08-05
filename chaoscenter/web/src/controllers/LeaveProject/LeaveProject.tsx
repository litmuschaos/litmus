import React from 'react';
import type { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import LeaveProjectView from '@views/LeaveProject';
import { ListInvitationsOkResponse, useLeaveProjectMutation } from '@api/auth/index.ts';

interface LeaveProjectControllerProps {
  handleClose: () => void;
  projectsJoinedRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListInvitationsOkResponse, unknown>>;
  projectID: string | undefined;
}

export default function LeaveProjectController(props: LeaveProjectControllerProps): React.ReactElement {
  const { handleClose, projectsJoinedRefetch, projectID } = props;

  const { mutate: leaveProjectMutation } = useLeaveProjectMutation(
    {},
    {
      onSuccess: () => projectsJoinedRefetch()
    }
  );

  return (
    <LeaveProjectView handleClose={handleClose} leaveProjectMutation={leaveProjectMutation} projectID={projectID} />
  );
}
