import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import { ListProjectsOkResponse, useDeleteProjectMutation } from '@api/auth';
import ProjectDashboardCardMenuView from '@views/ProjectDashboardCardMenu';

interface ProjectDashboardCardMenuControllerProps {
  handleClose: () => void;
  projectID: string;
  listProjectRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListProjectsOkResponse, unknown>>;
}

export default function ProjectDashboardCardMenuController(
  props: ProjectDashboardCardMenuControllerProps
): React.ReactElement {
  const { showSuccess } = useToaster();
  const { handleClose, projectID, listProjectRefetch } = props;

  const { mutate: deleteProjectMutation, isLoading } = useDeleteProjectMutation(
    {},
    {
      onSuccess: () => {
        showSuccess('Project Deleted Successfully.');
        handleClose();
        listProjectRefetch();
      }
    }
  );

  return (
    <ProjectDashboardCardMenuView
      deleteProjectMutation={deleteProjectMutation}
      loading={isLoading}
      projectId={projectID}
      handleClose={handleClose}
    />
  );
}
