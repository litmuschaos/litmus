import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { useParams } from 'react-router-dom';
import { parse } from 'yaml';
import { getHash, getScope } from '@utils';
import ChaosStudioView from '@views/ChaosStudio';
import { listExperiment, runChaosExperiment, saveChaosExperiment } from '@api/core';
import experimentYamlService from '@services/experiment';
import { InfrastructureType } from '@api/entities';
import Loader from '@components/Loader';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import { ExperimentManifest, StudioMode } from '@models';

export default function ChaosStudioCloneController(): React.ReactElement {
  const scope = getScope();
  const { showError } = useToaster();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const hasUnsavedChangesInURL = searchParams.get('unsavedChanges') === 'true';

  // <!-- counting state since we have 2 async functions and need to flip state when both of said functions have resolved their promises -->
  const [showStudio, setShowStudio] = React.useState<number>(0);

  const { experimentKey: experimentID } = useParams<{ experimentKey: string }>();

  const { data: experimentListData } = listExperiment({
    ...scope,
    experimentIDs: [experimentID],
    options: {
      onError: err => showError(err.message),
      fetchPolicy: 'cache-first',
      skip: showStudio >= 2 || hasUnsavedChangesInURL
    }
  });

  const experimentData = experimentListData?.listExperiment.experiments.filter(
    experiment => experiment.experimentID === experimentID
  )[0];

  React.useEffect(() => {
    if (experimentData && showStudio < 2 && !hasUnsavedChangesInURL) {
      const clonedExperimentName = getHash(2, experimentData.name);
      const infrastructureType = InfrastructureType.KUBERNETES;
      const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);
      updateSearchParams({
        experimentName: clonedExperimentName,
        infrastructureType: infrastructureType,
        experimentType: experimentData.experimentType
      });
      experimentHandler
        ?.updateExperimentDetails(experimentID, {
          name: clonedExperimentName,
          description: experimentData?.description,
          tags: experimentData?.tags,
          chaosInfrastructure: {
            id: experimentData?.infra?.infraID,
            namespace: experimentData.infra?.infraNamespace,
            environmentID: experimentData.infra?.environmentID
          }
        })
        .then(() => setShowStudio(oldState => oldState + 1));
      const parsedManifest = parse(experimentData.experimentManifest) as ExperimentManifest;
      parsedManifest.metadata.name = clonedExperimentName;
      experimentHandler
        ?.updateExperimentManifest(experimentID, parsedManifest)
        .then(() => setShowStudio(oldState => oldState + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentData, experimentID, hasUnsavedChangesInURL]);

  const [saveChaosExperimentMutation, { loading: saveChaosExperimentLoading }] = saveChaosExperiment({
    onError: error => showError(error.message)
  });
  const [runChaosExperimentMutation, { loading: runChaosExperimentLoading }] = runChaosExperiment({
    onError: error => showError(error.message)
  });

  return (
    <Loader loading={showStudio < 2 && !hasUnsavedChangesInURL} height="var(--page-min-height)">
      <ChaosStudioView
        saveChaosExperimentMutation={saveChaosExperimentMutation}
        runChaosExperimentMutation={runChaosExperimentMutation}
        loading={{
          saveChaosExperiment: saveChaosExperimentLoading,
          runChaosExperiment: runChaosExperimentLoading
        }}
        mode={StudioMode.CLONE}
      />
    </Loader>
  );
}
