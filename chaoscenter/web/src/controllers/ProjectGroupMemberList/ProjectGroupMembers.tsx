import { useParams } from 'react-router-dom';
import React from 'react';
import GroupsTableView from '@views/ProjectMembers/GroupsTable';
import { useGetProjectGroupsQuery } from '@api/auth';

export default function ProjectGroupMembersController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const { data, isLoading, refetch: getGroupsRefetch } = useGetProjectGroupsQuery({ project_id: projectID });

  return <GroupsTableView groups={data?.data} isLoading={isLoading} getGroupsRefetch={getGroupsRefetch} />;
}
