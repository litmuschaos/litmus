import { Color, FontVariation } from '@harnessio/design-system';
import { Container, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import type { ChaosData, ExperimentRunStatus } from '@api/entities';
import { useStrings } from '@strings';
import CustomStepLogController from '@controllers/CustomStepLog';
import css from '../ExperimentRunDetailsPanel.module.scss';

interface LogsTabViewProps {
  nodeType: string | undefined;
  chaosData: ChaosData | undefined;
  infraID: string | undefined;
  workflowRunID: string | undefined;
  podID: string;
  requestID: string;
  experimentPod?: string;
  namespace: string | undefined;
  phase: ExperimentRunStatus | undefined;
}

export default function LogsTabView({
  nodeType,
  chaosData,
  infraID,
  workflowRunID,
  podID,
  requestID,
  namespace,
  phase
}: LogsTabViewProps): React.ReactElement {
  const { getString } = useStrings();

  function getLogController(): React.ReactElement {
    return (
      <CustomStepLogController
        chaosData={chaosData}
        nodeType={nodeType}
        namespace={namespace}
        infraID={infraID}
        requestID={requestID}
        workflowRunID={workflowRunID}
        podName={podID}
        phase={phase}
      />
    );
  }

  return (
    <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
      <Container width="100%" className={css.simpleLogViewerContainer}>
        <Text font={{ variation: FontVariation.BODY }} color={Color.WHITE} padding="small" border>
          {getString('consoleLogs')}
        </Text>
        {getLogController()}
      </Container>
    </Layout.Vertical>
  );
}
