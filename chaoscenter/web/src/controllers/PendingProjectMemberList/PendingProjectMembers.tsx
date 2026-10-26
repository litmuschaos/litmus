import { useParams } from 'react-router-dom';
import React from 'react';
import PendingMembersTableView from '@views/ProjectMembers/PendingMembersTable';
import { useGetProjectMembersQuery } from '@api/auth';

export default function PendingProjectMembersController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const {
    data,
    isLoading,
    refetch: getPendingMembersRefetch
  } = useGetProjectMembersQuery({ project_id: projectID, state: 'not_accepted' });

  return (
    <PendingMembersTableView
      pendingMembers={data?.data}
      isLoading={isLoading}
      getPendingMembersRefetch={getPendingMembersRefetch}
    />
  );
}
