import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { runChaosExperiment, saveChaosExperiment } from '@api/core';
import ChaosStudioView from '@views/ChaosStudio';
import { StudioMode } from '@models';

export default function ChaosStudioCreateController(): React.ReactElement {
  const { showError } = useToaster();
  const [saveChaosExperimentMutation, { loading: saveChaosWorkflowLoading }] = saveChaosExperiment({
    onError: error => showError(error.message)
  });
  const [runChaosExperimentMutation, { loading: runChaosExperimentLoading }] = runChaosExperiment({
    onError: error => showError(error.message)
  });

  return (
    <ChaosStudioView
      saveChaosExperimentMutation={saveChaosExperimentMutation}
      runChaosExperimentMutation={runChaosExperimentMutation}
      loading={{
        saveChaosExperiment: saveChaosWorkflowLoading,
        runChaosExperiment: runChaosExperimentLoading
      }}
      mode={StudioMode.CREATE}
    />
  );
}
