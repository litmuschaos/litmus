import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { useCreateProjectMutation } from '@api/auth';
import CreateProjectView from '@views/CreateProject';

interface CreateProjectControllerProps {
  handleClose: () => void;
}

export default function CreateProjectController(props: CreateProjectControllerProps): React.ReactElement {
  const { handleClose } = props;
  const { showSuccess } = useToaster();
  const { mutate: createProjectMutation, isLoading } = useCreateProjectMutation(
    {},
    {
      onSuccess: () => {
        showSuccess('successs');
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
