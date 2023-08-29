import { useParams } from 'react-router-dom';
import React from 'react';
import ActiveMembersTableView from '@views/ProjectMembers/ActiveMembersTable';
import { useGetProjectMembersQuery } from '@api/auth';

export default function ActiveProjectMembersController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const {
    data,
    isLoading,
    refetch: getMembersRefetch
  } = useGetProjectMembersQuery({ project_id: projectID, state: 'accepted' });

  return (
    <ActiveMembersTableView activeMembers={data?.data} isLoading={isLoading} getMembersRefetch={getMembersRefetch} />
  );
}
