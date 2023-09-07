import React from 'react';
import type { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import {
  useGetOwnerProjectsQuery,
  useListInvitationsQuery,
  useAcceptInvitationMutation,
  GetUserWithProjectOkResponse,
  useGetApiTokensQuery
} from '@api/auth';
import UserCreatedProjectsView from '@views/UserCreatedProjects';
import ProjectsJoinedView from '@views/ProjectsJoined';
import ProjectInvitationsView from '@views/ProjectInvitations';
import { InvitationState } from '@models';
import { useAppStore } from '@context';
import ApiTokensView from '@views/ApiTokens';

interface AccountSettingsOverviewProjectsControllerProps {
  getUserWithProjectsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetUserWithProjectOkResponse, unknown>>;
}

export default function AccountSettingsOverviewProjectsController({
  getUserWithProjectsRefetch
}: AccountSettingsOverviewProjectsControllerProps): React.ReactElement {
  const { currentUserInfo } = useAppStore();
  const {
    data: ownerProjectsData,
    isLoading: getOwnerProjectsLoading,
    refetch: getProjectDataRefetch
  } = useGetOwnerProjectsQuery({});
  const {
    data: apiTokensData,
    isLoading: apiTokensLoading,
    refetch: apiTokensRefetch
  } = useGetApiTokensQuery({ user_id: currentUserInfo?.ID ?? '' });
  const {
    data: projectsJoinedData,
    isLoading: projectsJoinedLoading,
    refetch: projectsJoinedRefetch
  } = useListInvitationsQuery({
    invitation_state: InvitationState.ACCEPTED
  });
  const {
    data: invitationsData,
    isLoading: invitationsLoading,
    refetch: listInvitationsRefetch
  } = useListInvitationsQuery(
    {
      invitation_state: InvitationState.PENDING
    },
    {
      refetchInterval: 10000
    }
  );
  const { mutate: acceptInvitationMutation } = useAcceptInvitationMutation({});

  return (
    <>
      <UserCreatedProjectsView
        projectData={ownerProjectsData?.data}
        useGetOwnerProjectsQuery={getOwnerProjectsLoading}
        getProjectDataRefetch={getProjectDataRefetch}
      />
      <ApiTokensView
        apiTokensData={apiTokensData}
        useGetApiTokensQuery={apiTokensLoading}
        apiTokensRefetch={apiTokensRefetch}
      />
      <ProjectsJoinedView
        joinedProjects={projectsJoinedData}
        useGetUserWithProjectQueryLoading={projectsJoinedLoading}
        projectsJoinedRefetch={projectsJoinedRefetch}
        getUserWithProjectsRefetch={getUserWithProjectsRefetch}
      />
      <ProjectInvitationsView
        invitations={invitationsData}
        listInvitationsRefetch={listInvitationsRefetch}
        useListInvitationsQueryLoading={invitationsLoading}
        acceptInvitationMutation={acceptInvitationMutation}
        projectsJoinedRefetch={projectsJoinedRefetch}
        getUserWithProjectsRefetch={getUserWithProjectsRefetch}
      />
    </>
  );
}
