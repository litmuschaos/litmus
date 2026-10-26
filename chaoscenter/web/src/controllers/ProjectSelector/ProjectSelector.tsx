import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectSelectorView from '@views/ProjectSelector';
import { useGetProjectQuery } from '@api/auth';
import { useAppStore } from '@context';

export default function ProjectSelectorController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();
  const { updateAppStore } = useAppStore();

  const { data: projectData } = useGetProjectQuery(
    {
      project_id: projectID
    },
    {
      enabled: !!projectID,
      onSuccess: data => {
        updateAppStore({
          projectName: data.data?.name
        });
      }
    }
  );

  return <ProjectSelectorView currentProjectDetails={projectData?.data} />;
}
