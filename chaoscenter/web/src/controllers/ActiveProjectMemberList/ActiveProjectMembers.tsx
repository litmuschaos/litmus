import { useParams } from 'react-router-dom';
import React from 'react';
import ActiveMembersTableView from '@views/ProjectMembers/ActiveMembersTable';
import { ProjectMember, useGetProjectMembersQuery } from '@api/auth';
import { generateActiveMemberTableContent } from './helper';

export default function ActiveProjectMembersController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const [projectMembers, setProjectMembers] = React.useState<ProjectMember[]>([]);
  const {
    data,
    isLoading,
    refetch: getMembersRefetch
  } = useGetProjectMembersQuery({ project_id: projectID, state: 'accepted' });
  React.useEffect(() => {
    data && setProjectMembers(generateActiveMemberTableContent(data.data));
  }, [data]);

  return (
    <ActiveMembersTableView
      activeMembers={projectMembers}
      isLoading={isLoading}
      getMembersRefetch={getMembersRefetch}
    />
  );
}
