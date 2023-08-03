import React from 'react';
import ProjectInvitationsView from '@views/ProjectInvitations';
import { useListInvitationsQuery } from '@api/auth/index.ts';

export default function ProjectInvitationsController(): React.ReactElement {
  const { data, isLoading } = useListInvitationsQuery({
    invitation_state: 'Pending'
  });

  return <ProjectInvitationsView invitations={data} useListInvitationsQueryLoading={isLoading} />;
}
