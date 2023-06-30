import React from 'react';
import { useParams } from 'react-router-dom';
import config from '@config';
import ProjectSelectorView from '@views/ProjectSelector';
import type { Project } from '@models';
import useRequest from '@api/useRequest';

interface GetProjectResponse {
  data: Project | undefined;
}

export default function ProjectSelectorController(): React.ReactElement {
  const { projectID } = useParams<{ projectID: string }>();

  const { data: projectData } = useRequest<GetProjectResponse>({
    baseURL: config.restEndpoints?.authUri,
    url: `/get_project/${projectID}`,
    method: 'GET'
  });

  return <ProjectSelectorView currentProjectDetails={projectData?.data} />;
}
