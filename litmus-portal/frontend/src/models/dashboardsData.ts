import { PanelGroupResponse } from './graphql/dashboardsDetails';

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
  id?: string;
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

export interface ChaosEngineNamesAndNamespacesMap {
  engineName: string;
  engineNamespace: string;
  workflowName: string;
}
