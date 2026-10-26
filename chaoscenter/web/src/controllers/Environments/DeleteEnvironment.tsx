import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { deleteEnvironment } from '@api/core/environments';
import DeleteEnvironmentView from '@views/Environments/EnvironmentList/DeleteEnvironment';
import type { RefetchEnvironments } from './types';

interface DeleteEnvironmentControllerProps {
  environmentID: string;
  handleClose: () => void;
}

export default function DeleteEnvironmentController({
  environmentID,
  handleClose,
  refetchEnvironments
}: DeleteEnvironmentControllerProps & RefetchEnvironments): React.ReactElement {
  const { showError, showSuccess } = useToaster();

  const [deleteEnvironmentMutation] = deleteEnvironment({
    onError: error => showError(error.message),
    onCompleted: () => {
      showSuccess('Envrionment deleted successfully');
      refetchEnvironments && refetchEnvironments();
    }
  });

  return (
    <DeleteEnvironmentView
      environmentID={environmentID}
      deleteEnvironmentMutation={deleteEnvironmentMutation}
      handleClose={handleClose}
    />
  );
}
