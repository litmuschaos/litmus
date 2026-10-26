import React from 'react';
import { useToaster } from '@harnessio/uicore';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import UpdateProjectNameView from '@views/UpdateProjectName';
import { GetOwnerProjectsOkResponse, useUpdateProjectNameMutation } from '@api/auth';

interface UpdateProjectNameControllerProps {
  projectDetails: {
    projectID: string | undefined;
    projectName: string | undefined;
  };
  getProjectDataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetOwnerProjectsOkResponse, unknown>>;
  handleClose: () => void;
}

export default function UpdateProjectNameController(props: UpdateProjectNameControllerProps): React.ReactElement {
  const { projectDetails, getProjectDataRefetch, handleClose } = props;
  const { showSuccess } = useToaster();

  const { mutate: updateProjectNameMutation, isLoading } = useUpdateProjectNameMutation(
    {},
    {
      onSuccess: data => {
        showSuccess(data.message);
        getProjectDataRefetch();
      }
    }
  );

  return (
    <UpdateProjectNameView
      projectDetails={projectDetails}
      updateProjectNameMutation={updateProjectNameMutation}
      updateProjectNameMutationLoading={isLoading}
      handleClose={handleClose}
    />
  );
}
