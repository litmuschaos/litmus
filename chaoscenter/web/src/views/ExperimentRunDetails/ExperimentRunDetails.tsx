import React from 'react';
import { Container } from '@harnessio/uicore';
import { ExecutionData, ExperimentRunFaultStatus, ExperimentRunStatus } from '@api/entities';
import Loader from '@components/Loader';
import { useStrings } from '@strings';
import { useSearchParams, useRouteWithBaseUrl } from '@hooks';
import { getScope } from '@utils';
import { GenericErrorHandler } from '@errors';
import ExperimentRunDetailsGraph from '@views/ExperimentRunDetailsGraph';
import ExperimentRunDetailsPanel from '@views/ExperimentRunDetailsPanel';
import ExperimentRunDetailsHeader from './ExperimentRunDetailsHeader';

interface ExperimentRunDetailsViewProps {
  experimentID: string;
  experimentName: string | undefined;
  experimentExecutionDetails: ExecutionData | undefined;
  experimentRunID: string;
  manifest?: string;
  infraID?: string;
  infrastructureName?: string;
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
  experimentRunID,
  infrastructureName,
  manifest,
  loading,
  infraID,
  phase,
  resiliencyScore,
  rightSideBar,
  runExists
}: ExperimentRunDetailsViewProps): React.ReactElement {
  const scope = getScope();
  const paths = useRouteWithBaseUrl();
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const fault = searchParams.get('fault') ?? '';
  const [selectedNodeID, setSelectedNodeID] = React.useState<string>(fault);

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

  React.useEffect(() => {
    if (experimentExecutionDetails) {
      const runningNode =
        experimentExecutionDetails.nodes &&
        Object.entries(experimentExecutionDetails.nodes).find(
          ([_, node]) =>
            node.phase === ExperimentRunFaultStatus.RUNNING && node.type !== 'StepGroup' && node.type !== 'Steps'
        );
      if (runningNode && runningNode[0] !== selectedNodeID) setSelectedNodeID(runningNode[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentExecutionDetails]);

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
    setSelectedNodeID(event.data.id);
  };

  const handleCanvasClick = (): void => void 0;

  return (
    <ExperimentRunDetailsHeader
      breadcrumbs={breadcrumbs}
      title={experimentExecutionDetails?.name}
      infrastructureName={infrastructureName}
      experimentExecutionDetails={experimentExecutionDetails}
      phase={phase}
      resiliencyScore={resiliencyScore}
      rightSideBar={rightSideBar}
    >
      <Loader loading={loading?.listExperimentRun || phase === ExperimentRunStatus.QUEUED} height="calc(100vh - 120px)">
        <Container width={'100%'} height={'100%'} flex={selectedNodeID === ''}>
          {/* Left Side for Pipeline Diagram */}
          <ExperimentRunDetailsGraph
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
            setSelectedNodeID={setSelectedNodeID}
            infraID={infraID}
            experimentRunID={experimentRunID}
            podID={selectedNodeID}
            manifest={manifest}
            loading={loading?.listExperimentRun}
          />
        </Container>
      </Loader>
    </ExperimentRunDetailsHeader>
  );
}
