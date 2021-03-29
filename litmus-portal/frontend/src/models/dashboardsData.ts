import { GraphMetric } from 'litmus-ui';
import { PanelGroupResponse, PanelResponse } from './graphql/dashboardsDetails';
import { promQueryInput } from './graphql/prometheus';
import { ChaosData } from './graphql/workflowListData';

export interface PanelGroupMap {
  groupName: string;
  panels: string[];
}

export interface DashboardData {
  dashboardID?: number;
  name?: string;
  urlToIcon?: string;
  description?: string;
  handleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  information?: string;
  panelGroupMap?: PanelGroupMap[];
}

export interface DashboardDetails {
  id: string;
  name: string;
  dashboardType: string;
  dataSourceType: string;
  dataSourceID: string;
  dataSourceName: string;
  agentID: string;
  agentName: string;
  information: string;
  panelGroupMap: PanelGroupMap[];
  panelGroups?: PanelGroupResponse[];
}

export interface ChaosResultNamesAndNamespacesMap {
  resultName: string;
  resultNamespace: string;
  workflowName: string;
  experimentName: string;
  selectedWorkflowIds: string[];
}

export interface RunWiseChaosMetrics {
  runIndex: number;
  runID: string;
  lastUpdatedTimeStamp: number;
  probeSuccessPercentage: string;
  experimentStatus: string;
  experimentVerdict: string;
  resilienceScore: string;
  workflowStatus: string;
}

export interface WorkflowAndExperimentMetaDataMap {
  workflowID: string;
  workflowName: string;
  experimentName: string;
  targetApp: string;
  targetNamespace: string;
  runWiseChaosMetrics: RunWiseChaosMetrics[];
}

export interface ExperimentNameAndChaosDataMap {
  experimentName: string;
  chaosData: ChaosData;
}

export interface WorkflowRunWiseDetails {
  idsOfWorkflowRuns: string[];
  resilienceScoreForWorkflowRuns: number[];
  statusOfWorkflowRuns: string[];
  experimentNameWiseChaosDataOfWorkflowRuns: ExperimentNameAndChaosDataMap[][];
}

export interface ChaosEventDetails {
  id: string;
  legend: string;
  workflow: string;
  experiment: string;
  target: string;
  result: string;
  chaosMetrics: WorkflowAndExperimentMetaDataMap;
  showOnTable: Boolean;
}

export interface ChaosInformation {
  promQueries: promQueryInput[];
  chaosQueryIDs: string[];
  chaosEventList: ChaosEventDetails[];
  numberOfWorfklowsUnderConsideration: number;
}

export interface ChaosDataUpdates {
  chaosData: Array<EventMetric>;
  reGenerate: Boolean;
}

export interface EventMetric extends GraphMetric {
  subData?: Array<{
    subDataName: string;
    value: string;
  }>;
}

export interface GraphPanelProps extends PanelResponse {
  className?: string;
  chaos_data?: Array<EventMetric>;
}

export interface GraphPanelGroupProps extends PanelGroupResponse {
  chaos_data?: Array<EventMetric>;
}
