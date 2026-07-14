import React from 'react';
import { Container, Layout, Text, useToaster } from '@harnessio/uicore';
import { useParams } from 'react-router-dom';
import { Color, FontVariation } from '@harnessio/design-system';
import { parse } from 'yaml';
import { ExecutionData, ExperimentRunFaultStatus, ExperimentRunStatus, Infra, InfrastructureType } from '@api/entities';
import Loader from '@components/Loader';
import { useStrings } from '@strings';
import { useSearchParams, useRouteWithBaseUrl } from '@hooks';
import { getScope } from '@utils';
import { GenericErrorHandler } from '@errors';
import ExperimentRunDetailsGraph from '@views/ExperimentRunDetailsGraph';
import ExperimentRunDetailsPanel from '@views/ExperimentRunDetailsPanel';
import { getProbesInExperimentRun, ProbeInRuns } from '@api/core';

import experimentYamlService from '@services/experiment';
import type { ExperimentManifest } from '@models';
import { getExperimentLazy } from '@api/core/experiments/getExperiment';
import ExperimentRunDetailsHeader from './ExperimentRunDetailsHeader';

interface ExperimentRunDetailsViewProps {
  experimentID: string;
  experimentName: string | undefined;
  experimentExecutionDetails: ExecutionData | undefined;
  runSequence: number | undefined;
  experimentRunID: string;
  manifest?: string;
  infra?: Infra;
  phase?: ExperimentRunStatus;
  resiliencyScore?: number;
  rightSideBar?: React.ReactElement;
  loading?: {
    listExperimentRun?: boolean;
  };
  runExists: boolean | undefined;
}

export default function ExperimentRunDetailsView({
  experimentID,
  experimentName,
  experimentExecutionDetails,
  runSequence,
  experimentRunID,
  manifest,
  loading,
  infra,
  phase,
  resiliencyScore,
  rightSideBar,
  runExists
}: ExperimentRunDetailsViewProps): React.ReactElement {
  const { runID, notifyID } = useParams<{ experimentID: string; runID: string; notifyID: string }>();
  const scope = getScope();
  const paths = useRouteWithBaseUrl();
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const fault = searchParams.get('fault') ?? '';
  const [selectedNodeID, setSelectedNodeID] = React.useState<string>(fault);
  const [isNodeManuallySelected, setIsNodeManuallySelected] = React.useState<boolean>(false);
  const [probeData, setProbeData] = React.useState<ProbeInRuns[] | undefined>();
  const { showError } = useToaster();
  const parsedManifest = parse(manifest ?? '') as ExperimentManifest;

  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);
  const experimentSteps = experimentHandler?.getFaultsFromExperimentManifest(parsedManifest, false) ?? [];
  const breadcrumbs = [
    {
      label: getString('chaosExperiments'),
      url: paths.toExperiments()
    },
    {
      label: experimentName ?? '',
      url: paths.toExperimentRunHistory({ experimentID: experimentID })
    }
  ];

  const [getExperimentQuery, { loading: experimentLoading }] = getExperimentLazy({
    onError: err => showError(err.message)
  });

  const [getProbesInExperimentRunQuery, { loading: probesInRunsLoading }] = getProbesInExperimentRun({
    onError: err => showError(err.message)
  });

  React.useEffect(() => {
    if (selectedNodeID) {
      if (experimentExecutionDetails && notifyID) {
        getExperimentQuery({
          variables: {
            projectID: scope.projectID,
            experimentID: experimentID
          }
        }).then(result => {
          result.data &&
            getProbesInExperimentRunQuery({
              variables: {
                projectID: scope.projectID,
                experimentRunID:
                  result.data.getExperiment.experimentDetails.recentExperimentRunDetails[0].experimentRunID,
                faultName: experimentExecutionDetails.nodes?.[selectedNodeID].name
              }
            }).then(probeArray => setProbeData(probeArray.data?.getProbesInExperimentRun));
        });
      } else if (experimentExecutionDetails && !notifyID && runID) {
        getProbesInExperimentRunQuery({
          variables: {
            projectID: scope.projectID,
            experimentRunID: runID,
            faultName: experimentExecutionDetails.nodes?.[selectedNodeID].name
          }
        }).then(probeArray => setProbeData(probeArray.data?.getProbesInExperimentRun));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeID]);

  React.useEffect(() => {
    if (experimentExecutionDetails?.nodes && !isNodeManuallySelected) {
      const runningNodes = Object.entries(experimentExecutionDetails.nodes).filter(
        ([_, node]) =>
          node.phase === ExperimentRunFaultStatus.RUNNING && node.type !== 'StepGroup' && node.type !== 'Steps'
      );
      const lastRunningNode = runningNodes.pop();
      if (lastRunningNode && lastRunningNode[0] !== selectedNodeID) setSelectedNodeID(lastRunningNode[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentExecutionDetails]);

  /* the running node is auto selected every time nodes update but there are cases when user is viewing details
  of other nodes by manual selection, in those cases the selected node automatically shifts to running node,
  leading to poor UX. This useEffect is to mitigate that by not auto-selecting the running node for the next 30s
  after the user has manually selected a node in the graph */
  // React.useEffect(() => {
  //   let timerToClearManuallySelectedState: NodeJS.Timeout;
  //   if (isNodeManuallySelected) {
  //     timerToClearManuallySelectedState = setTimeout(() => {
  //       setIsNodeManuallySelected(false);
  //     }, 30000);
  //   }
  //   return () => clearTimeout(timerToClearManuallySelectedState);
  // }, [isNodeManuallySelected]);

  if (runExists !== undefined && !runExists)
    return (
      <GenericErrorHandler
        errStatusCode={400}
        errorMessage={getString('genericResourceNotFoundError', {
          resource: getString('experimentRunID'),
          resourceID: experimentRunID,
          projectID: scope.projectID
        })}
      />
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClickNode = (event: any): void => {
    setIsNodeManuallySelected(true);
    setSelectedNodeID(event.data.id);
  };

  const handleCanvasClick = (): void => void 0;

  return (
    <ExperimentRunDetailsHeader
      breadcrumbs={breadcrumbs}
      title={
        experimentName && (
          <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'baseline' }}>
            <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
              {experimentName}
            </Text>
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500}>
              {`(${getString('executionID')}: ${runSequence})`}
            </Text>
          </Layout.Horizontal>
        )
      }
      infrastructureName={infra?.name}
      experimentExecutionDetails={experimentExecutionDetails}
      phase={phase}
      resiliencyScore={resiliencyScore}
      rightSideBar={rightSideBar}
    >
      <Loader loading={loading?.listExperimentRun || phase === ExperimentRunStatus.QUEUED} height="calc(100vh - 120px)">
        <Container width={'100%'} height={'100%'} flex={selectedNodeID === ''}>
          {/* Left Side for Pipeline Diagram */}
          <ExperimentRunDetailsGraph
            steps={experimentSteps}
            executionData={experimentExecutionDetails}
            selectedNodeID={selectedNodeID}
            handleClickNode={handleClickNode}
            handleCanvasClick={handleCanvasClick}
          />
          {/* Right Panel for Fault details */}
          <ExperimentRunDetailsPanel
            node={experimentExecutionDetails?.nodes?.[selectedNodeID]}
            phase={experimentExecutionDetails?.phase as ExperimentRunStatus}
            namespace={experimentExecutionDetails?.namespace}
            probeData={probeData}
            infraID={infra?.infraID}
            setSelectedNodeID={setSelectedNodeID}
            experimentRunID={experimentRunID}
            podID={selectedNodeID}
            manifest={manifest}
            loading={loading?.listExperimentRun || probesInRunsLoading || experimentLoading}
          />
        </Container>
      </Loader>
    </ExperimentRunDetailsHeader>
  );
}
