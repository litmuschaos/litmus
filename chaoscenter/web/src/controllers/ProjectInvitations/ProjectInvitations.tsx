import React from 'react';
import ProjectInvitationsView from '@views/ProjectInvitations';
import { useAcceptInvitationMutation, useListInvitationsQuery } from '@api/auth/index.ts';

export default function ProjectInvitationsController(): React.ReactElement {
  const {
    data,
    isLoading,
    refetch: listInvitationsMutationRefetch
  } = useListInvitationsQuery({
    invitation_state: 'Pending'
  });
  const { mutate: acceptInvitationMutation } = useAcceptInvitationMutation({});

  return (
    <ProjectInvitationsView
      invitations={data}
      listInvitationsMutationRefetch={listInvitationsMutationRefetch}
      useListInvitationsQueryLoading={isLoading}
      acceptInvitationMutation={acceptInvitationMutation}
    />
  );
}
