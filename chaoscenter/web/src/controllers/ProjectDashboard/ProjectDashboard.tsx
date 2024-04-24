import React from 'react';
import { useListProjectsQuery } from '@api/auth';
import ProjectDashboardView from '@views/ProjectDashboard';

export default function ProjectDashboardController(): React.ReactElement {
  const { data: projectData, isLoading, refetch } = useListProjectsQuery({});

  const projects = projectData?.data;
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  return (
    <ProjectDashboardView
      projects={projects}
      loading={isLoading}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      listProjectRefetch={refetch}
    />
  );
}
