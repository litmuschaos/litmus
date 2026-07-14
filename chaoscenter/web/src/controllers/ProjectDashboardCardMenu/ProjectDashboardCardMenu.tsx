import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import { ListProjectsOkResponse, useDeleteProjectMutation } from '@api/auth';
import ProjectDashboardCardMenuView from '@views/ProjectDashboardCardMenu';
import { useStrings } from '@strings';

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
  const { getString } = useStrings();

  const { mutate: deleteProjectMutation, isLoading } = useDeleteProjectMutation(
    {},
    {
      onSuccess: () => {
        showSuccess(getString('projectDeletedSuccess'));
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
