import { useParams } from 'react-router-dom';
import React from 'react';
import { getActiveMembers } from '@api/core/projects';
import PendingMembersTableView from '@views/ProjectMembers/PendingMembersTable';
import { generateActiveMemberTableContent } from '@controllers/ActiveProjectMemberList/helper';
import type { ProjectMember } from '../ActiveProjectMemberList/types';

export default function PendingProjectMembersController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const [projectMembers, setProjectMembers] = React.useState<ProjectMember[]>([]);
  const { data } = getActiveMembers(projectID, 'pending');
  React.useEffect(() => {
    data && setProjectMembers(generateActiveMemberTableContent(data.data));
  }, [data]);

  return <PendingMembersTableView activeMembers={projectMembers} />;
}
