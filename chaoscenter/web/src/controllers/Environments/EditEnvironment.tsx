import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { getEnvironment, updateEnvironment } from '@api/core/environments';
import CreateEnvironment from '@views/Environments/EnvironmentList/CreateEnvironment';
import { getScope } from '@utils';
import type { RefetchEnvironments } from './types';

interface EditEnvironmentControllerProps {
  environmentID: string;
  handleClose: () => void;
}

export default function EditEnvironmentController({
  environmentID,
  handleClose,
  refetchEnvironments
}: EditEnvironmentControllerProps & RefetchEnvironments): React.ReactElement {
  const { showError, showSuccess } = useToaster();
  const scope = getScope();

  const [editEnvironmentMutation] = updateEnvironment({
    onError: error => showError(error.message),
    onCompleted: () => {
      showSuccess('Envrionment edited successfully');
      refetchEnvironments && refetchEnvironments();
      handleClose();
    }
  });

  const { data: environmentDetails, loading: getEnvironmentLoading } = getEnvironment({
    projectID: scope.projectID,
    environmentID: environmentID
  });

  return (
    <CreateEnvironment
      closeModal={handleClose}
      loading={{
        getEnvironment: getEnvironmentLoading
      }}
      editable={true}
      environmentID={environmentID}
      mutation={{ updateEnvironment: editEnvironmentMutation }}
      existingEnvironment={environmentDetails?.getEnvironment}
    />
  );
}
