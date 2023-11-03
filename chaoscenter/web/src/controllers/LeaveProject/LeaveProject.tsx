import React from 'react';
import type { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import LeaveProjectView from '@views/LeaveProject';
import { GetUserWithProjectOkResponse, ListInvitationsOkResponse, useLeaveProjectMutation } from '@api/auth';

interface LeaveProjectControllerProps {
  handleClose: () => void;
  projectsJoinedRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListInvitationsOkResponse, unknown>>;
  projectID: string | undefined;
  getUserWithProjectsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetUserWithProjectOkResponse, unknown>>;
}

export default function LeaveProjectController(props: LeaveProjectControllerProps): React.ReactElement {
  const { handleClose, projectsJoinedRefetch, projectID, getUserWithProjectsRefetch } = props;

  const { mutate: leaveProjectMutation } = useLeaveProjectMutation(
    {},
    {
      onSuccess: () => {
        projectsJoinedRefetch();
        getUserWithProjectsRefetch();
      }
    }
  );

  return (
    <LeaveProjectView handleClose={handleClose} leaveProjectMutation={leaveProjectMutation} projectID={projectID} />
  );
}
