import { GraphMetric } from 'litmus-ui';
import { PanelGroupResponse, PanelResponse } from './graphql/dashboardsDetails';

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

export interface DashboardConfigurationDetails {
  name: string;
  type: string;
  dataSourceName: string;
  dataSourceURL: string;
  agent: string;
}

export interface PanelNameAndID {
  name: string;
  id: string;
}

export interface GraphPanelProps extends PanelResponse {
  className?: string;
  controllerPanelID?: string;
}

export interface GraphPanelGroupProps extends PanelGroupResponse {
  selectedPanels?: string[];
}

export interface ParsedPrometheusData {
  seriesData: Array<GraphMetric>;
  chaosData: Array<GraphMetric>;
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
