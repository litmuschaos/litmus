import { useParams } from 'react-router-dom';
import React from 'react';
import PendingMembersTableView from '@views/ProjectMembers/PendingMembersTable';
import { generateActiveMemberTableContent } from '@controllers/ActiveProjectMemberList/helper';
import { ProjectMember, useGetProjectMembersQuery } from '@api/auth';

export default function PendingProjectMembersController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const [projectMembers, setProjectMembers] = React.useState<ProjectMember[]>([]);
  const {
    data,
    isLoading,
    refetch: getPendingMembersRefetch
  } = useGetProjectMembersQuery({ project_id: projectID, state: 'not_accepted' });
  React.useEffect(() => {
    data && setProjectMembers(generateActiveMemberTableContent(data.data));
  }, [data]);

  return (
    <PendingMembersTableView
      pendingMembers={projectMembers}
      isLoading={isLoading}
      getPendingMembersRefetch={getPendingMembersRefetch}
    />
  );
}
