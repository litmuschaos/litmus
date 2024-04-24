import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import { ListProjectsOkResponse, useCreateProjectMutation } from '@api/auth';
import CreateProjectView from '@views/CreateProject';

interface CreateProjectControllerProps {
  handleClose: () => void;
  listProjectRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListProjectsOkResponse, unknown>>;
}

export default function CreateProjectController(props: CreateProjectControllerProps): React.ReactElement {
  const { handleClose, listProjectRefetch } = props;
  const { showSuccess } = useToaster();
  const { mutate: createProjectMutation, isLoading } = useCreateProjectMutation(
    {},
    {
      onSuccess: () => {
        showSuccess('successs');
        listProjectRefetch();
      }
    }
  );

  return (
    <CreateProjectView
      createProjectMutation={createProjectMutation}
      createProjectMutationLoading={isLoading}
      handleClose={handleClose}
    />
  );
}
