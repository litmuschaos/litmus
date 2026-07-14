import React from 'react';
import { useToaster } from '@harnessio/uicore';
import type { RefetchProbes } from '@controllers/ChaosProbes';
import { getScope } from '@utils';
import type { InfrastructureType } from '@api/entities';
import { validateUniqueProbe } from '@api/core/probe/validateUniqueProbe';
import { addK8SProbe, addKubernetesCMDProbe, addKubernetesHTTPProbe, addPROMProbe } from '@api/core';
import AddProbeModalWizardView from '@views/AddProbeModalWizard';

interface AddHubModalWizardControllerProps extends RefetchProbes {
  hideDarkModal: () => void;
  infrastructureType: InfrastructureType | undefined;
}

export default function AddProbeModalWizardController({
  hideDarkModal,
  refetchProbes,
  infrastructureType
}: AddHubModalWizardControllerProps): React.ReactElement {
  const scope = getScope();
  const { showError } = useToaster();

  const [validateUniqueProbeQuery] = validateUniqueProbe({
    ...scope,
    onError: err => showError(err.message)
  });

  const [
    addKubernetesHTTPProbeMutation,
    { loading: addKubernetesHTTPProbeMutationLoading, error: addKubernetesHTTPProbeMutationError }
  ] = addKubernetesHTTPProbe({
    onCompleted: () => {
      refetchProbes?.();
    },
    onError: err => showError(err.message)
  });

  const [
    addKubernetesCMDProbeMutation,
    { loading: addKubernetesCMDProbeMutationLoading, error: addKubernetesCMDProbeMutationError }
  ] = addKubernetesCMDProbe({
    onCompleted: () => {
      refetchProbes?.();
    },
    onError: err => showError(err.message)
  });

  const [addK8SProbeMutation, { loading: addK8SProbeMutationLoading, error: addK8SProbeMutationError }] = addK8SProbe({
    onCompleted: () => {
      refetchProbes?.();
    },
    onError: err => showError(err.message)
  });

  const [addPROMProbeMutation, { loading: addPROMProbeMutationLoading, error: addPROMProbeMutationError }] =
    addPROMProbe({
      onCompleted: () => {
        refetchProbes?.();
      },
      onError: err => showError(err.message)
    });

  const loading =
    addKubernetesHTTPProbeMutationLoading ||
    addKubernetesCMDProbeMutationLoading ||
    addK8SProbeMutationLoading ||
    addPROMProbeMutationLoading;
  const error =
    addKubernetesHTTPProbeMutationError ||
    addKubernetesCMDProbeMutationError ||
    addK8SProbeMutationError ||
    addPROMProbeMutationError;

  return (
    <AddProbeModalWizardView
      mutation={{
        addKubernetesHTTPProbeMutation,
        addK8SProbeMutation,
        addKubernetesCMDProbeMutation,
        addPROMProbeMutation
      }}
      infrastructureType={infrastructureType}
      validateName={validateUniqueProbeQuery}
      loading={loading}
      isEdit={false}
      error={error}
      hideDarkModal={hideDarkModal}
    />
  );
}
