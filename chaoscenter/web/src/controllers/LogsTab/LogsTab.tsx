import React from 'react';
import { v4 as uuid } from 'uuid';
import type { ChaosData, ExperimentRunStatus } from '@api/entities';
import LogsTabView from '@views/ExperimentRunDetailsPanel/Tabs/LogsTab';

interface LogsTabControllerProps {
  nodeType: string | undefined;
  chaosData: ChaosData | undefined;
  infraID: string | undefined;
  workflowRunID: string | undefined;
  podID: string;
  experimentPod?: string;
  namespace: string | undefined;
  phase: ExperimentRunStatus | undefined;
}

export default function LogsTabController(props: LogsTabControllerProps): React.ReactElement {
  return <LogsTabView requestID={props.podID + uuid()} {...props} />;
}
