import React from 'react';
import UserCreatedProjectsView from '@views/UserCreatedProjects';
import { useGetOwnerProjectsQuery } from '@api/auth/index.ts';

export default function UserCreatedProjectsController(): React.ReactElement {
  const { data: ownerProjectsData, isLoading, refetch: getProjectDataRefetch } = useGetOwnerProjectsQuery({});

  return (
    <UserCreatedProjectsView
      projectData={ownerProjectsData?.data}
      useGetOwnerProjectsQuery={isLoading}
      getProjectDataRefetch={getProjectDataRefetch}
    />
  );
}
