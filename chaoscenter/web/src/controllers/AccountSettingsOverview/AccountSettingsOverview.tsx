import React from 'react';
import AccountSettingsOverviewView from '@views/AccountSettingsOverview';
import { useGetUserWithProjectQuery } from '@api/auth';
import { InvitationState } from '@models';

interface AccountSettingsOverviewControllerProps {
  username: string | undefined;
}

export default function AccountSettingsOverviewController(
  props: AccountSettingsOverviewControllerProps
): React.ReactElement {
  const { username = '' } = props;

  const { data, refetch: getUserWithProjectsRefetch } = useGetUserWithProjectQuery(
    {
      username: username
    },
    {
      enabled: username !== ''
    }
  );

  const userCreatedProjects = data?.data?.projects?.filter(project => project.createdBy?.username === username).length;
  const userJoinedProjects = data?.data?.projects?.filter(
    project =>
      project.createdBy?.username !== username &&
      project.members?.find(member => member.username === username)?.invitation === InvitationState.ACCEPTED
  ).length;

  return (
    <AccountSettingsOverviewView
      userProjectData={data}
      getUserWithProjectsRefetch={getUserWithProjectsRefetch}
      projectCount={{
        userCreatedProjects,
        userJoinedProjects
      }}
    />
  );
}
