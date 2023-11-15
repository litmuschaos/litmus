import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { useParams } from 'react-router-dom';
import { parse } from 'yaml';
import { getScope } from '@utils';
import ChaosStudioView from '@views/ChaosStudio';
import { listExperiment, runChaosExperiment, saveChaosExperiment } from '@api/core';
import experimentYamlService from '@services/experiment';
import { ExperimentType, InfrastructureType, RecentExperimentRun } from '@api/entities';
import Loader from '@components/Loader';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import RightSideBarV2 from '@components/RightSideBarV2';
import { StudioMode } from '@models';
import { cronEnabled } from 'utils';

export default function ChaosStudioEditController(): React.ReactElement {
  const scope = getScope();
  const { showError } = useToaster();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const hasUnsavedChangesInURL = searchParams.get('unsavedChanges') === 'true';
  const experimentType = searchParams.get('experimentType');

  // <!-- counting state since we have 2 async functions and need to flip state when both of said functions have resolved their promises -->
  const [showStudio, setShowStudio] = React.useState<number>(0);

  const { experimentKey: experimentID } = useParams<{ experimentKey: string }>();

  const { data: experimentListData, refetch: listExperimentRefetch } = listExperiment({
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

  const [lastExperimentRun, setLastExperimentRun] = React.useState<RecentExperimentRun | undefined>();
  const [isCronEnabled, setIsCronEnabled] = React.useState<boolean>();

  React.useEffect(() => {
    if (experimentData && showStudio < 2 && !hasUnsavedChangesInURL) {
      const infrastructureType = InfrastructureType.KUBERNETES;
      const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);
      updateSearchParams({
        experimentName: experimentData.name,
        infrastructureType: infrastructureType,
        experimentType: experimentData.experimentType
      });
      experimentHandler
        ?.updateExperimentDetails(experimentID, {
          name: experimentData?.name,
          description: experimentData?.description,
          tags: experimentData?.tags,
          chaosInfrastructure: {
            id: experimentData?.infra?.infraID,
            namespace: experimentData.infra?.infraNamespace,
            environmentID: experimentData?.infra?.environmentID
          }
        })
        .then(() => setShowStudio(oldState => oldState + 1));
      experimentHandler
        ?.updateExperimentManifest(experimentID, parse(experimentData.experimentManifest))
        .then(() => setShowStudio(oldState => oldState + 1));
      setLastExperimentRun(experimentData.recentExperimentRunDetails?.[0]);

      const parsedManifest = JSON.parse(experimentData.experimentManifest);
      const validateCron = experimentData?.experimentType === ExperimentType.CRON && cronEnabled(parsedManifest);
      setIsCronEnabled(validateCron);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentData, experimentID, hasUnsavedChangesInURL]);

  const [saveChaosExperimentMutation, { loading: saveChaosExperimentLoading }] = saveChaosExperiment({
    onError: error => showError(error.message),
    onCompleted: () => listExperimentRefetch()
  });
  const [runChaosExperimentMutation, { loading: runChaosExperimentLoading }] = runChaosExperiment({
    onError: error => showError(error.message),
    onCompleted: () => listExperimentRefetch()
  });

  const rightSideBarV2 = (
    <RightSideBarV2
      experimentID={experimentID}
      isCronEnabled={isCronEnabled}
      isEditMode
      phase={lastExperimentRun?.phase}
      experimentType={experimentType as ExperimentType}
    />
  );

  return (
    <Loader loading={showStudio < 2 && !hasUnsavedChangesInURL} height="var(--page-min-height)">
      <ChaosStudioView
        saveChaosExperimentMutation={saveChaosExperimentMutation}
        runChaosExperimentMutation={runChaosExperimentMutation}
        loading={{
          saveChaosExperiment: saveChaosExperimentLoading,
          runChaosExperiment: runChaosExperimentLoading
        }}
        mode={StudioMode.EDIT}
        rightSideBar={rightSideBarV2}
        allowSwitchToRunHistory={lastExperimentRun !== undefined}
      />
    </Loader>
  );
}
