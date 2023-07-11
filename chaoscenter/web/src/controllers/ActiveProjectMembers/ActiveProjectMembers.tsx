import { useParams } from 'react-router-dom';
import React from 'react';
import { getActiveMembers } from '@api/core/projects';
import ActiveMembersTableView from '@views/ProjectMembers/ActiveMembersTable';
import { generateActiveMemberTableContent } from './helper';
import type { ProjectMember } from './types';

export default function ActiveProjectMembersController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const [projectMembers, setProjectMembers] = React.useState<ProjectMember[]>([]);
  const { data } = getActiveMembers(projectID);
  React.useEffect(() => {
    data && setProjectMembers(generateActiveMemberTableContent(data.data));
  }, [data]);

  return <ActiveMembersTableView activeMembers={projectMembers} />;
}
