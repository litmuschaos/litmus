import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectSelectorView from '@views/ProjectSelector';
import { useGetProjectQuery } from '@api/auth';

export default function ProjectSelectorController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();

  const { data: projectData } = useGetProjectQuery(
    {
      project_id: projectID
    },
    {
      enabled: !!projectID
    }
  );

  return <ProjectSelectorView currentProjectDetails={projectData?.data} />;
}
