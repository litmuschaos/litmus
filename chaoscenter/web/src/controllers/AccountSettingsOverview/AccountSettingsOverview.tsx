import React from 'react';
import AccountSettingsOverviewView from '@views/AccountSettingsOverview';
import { useGetUserWithProjectQuery } from '@api/auth/index.ts';

interface AccountSettingsOverviewControllerProps {
  username: string | undefined;
}

export default function AccountSettingsOverviewController(
  props: AccountSettingsOverviewControllerProps
): React.ReactElement {
  const { username } = props;

  const { data } = useGetUserWithProjectQuery(
    {
      username: username ?? ''
    },
    {
      enabled: !!username
    }
  );

  const userCreatedProjects = data?.data?.projects?.filter(project => project.createdBy?.username === username).length;
  const userJoinedProjects = data?.data?.projects?.filter(project => project.createdBy?.username !== username).length;

  return (
    <AccountSettingsOverviewView
      userProjectData={data}
      projectCount={{
        userCreatedProjects,
        userJoinedProjects
      }}
    />
  );
}
