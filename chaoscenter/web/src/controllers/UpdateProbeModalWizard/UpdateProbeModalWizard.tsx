import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { getProbeAllProperties, updateProbe, validateUniqueProbe } from '@api/core';
import type { RefetchProbes } from '@controllers/ChaosProbes';
import AddProbeModalWizardView from '@views/AddProbeModalWizard';
import type { InfrastructureType } from '@api/entities';
import { getScope } from '@utils';
import Loader from '@components/Loader';

interface UpdateHubModalWizardControllerProps extends RefetchProbes {
  hideDarkModal: () => void;
  probeName: string;
  infrastructureType: InfrastructureType | undefined;
}

export default function UpdateProbeModalWizardController({
  hideDarkModal,
  refetchProbes,
  probeName,
  infrastructureType
}: UpdateHubModalWizardControllerProps): React.ReactElement {
  const { showError, showSuccess } = useToaster();
  const scope = getScope();

  const [validateUniqueProbeQuery] = validateUniqueProbe({
    ...scope,
    onError: err => showError(err)
  });

  const [updateProbeMutation, { loading: updateProbeLoading, error }] = updateProbe({
    onCompleted: data => {
      showSuccess(data.updateProbe);
      refetchProbes?.();
    },
    onError: err => showError(err.message)
  });

  const { data: probeData, loading: getProbeLoading } = getProbeAllProperties({
    ...scope,
    probeName: probeName,
    options: {
      onError: err => showError(err.message)
    }
  });

  const loading = updateProbeLoading || getProbeLoading;

  return (
    <Loader loading={loading}>
      <AddProbeModalWizardView
        mutation={{ updateProbeMutation }}
        probeData={probeData?.getProbe}
        loading={loading}
        validateName={validateUniqueProbeQuery}
        error={error}
        isEdit={true}
        infrastructureType={infrastructureType}
        hideDarkModal={hideDarkModal}
      />
    </Loader>
  );
}
