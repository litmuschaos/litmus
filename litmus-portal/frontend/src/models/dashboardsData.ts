import { PanelGroupResponse, PanelResponse } from './graphql/dashboardsDetails';
import { promQueryInput } from './graphql/prometheus';

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
  isRemoved: string[];
}

export interface ChaosEventDetails {
  id: string;
  legend: string;
  workflow: string;
  experiment: string;
  target: string;
  result: string;
}

export interface ChaosInformation {
  promQueries: promQueryInput[];
  chaosQueryIDs: string[];
  chaosEventList: ChaosEventDetails[];
}

export interface GraphPanelProps extends PanelResponse {
  className?: string;
}
