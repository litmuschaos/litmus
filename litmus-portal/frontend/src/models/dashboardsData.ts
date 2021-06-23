import { GraphMetric } from 'litmus-ui';
import {
  ApplicationMetadata,
  ListDashboardResponse,
  Panel,
  PanelGroup,
  PanelGroupResponse,
  PanelOption,
  PanelResponse,
  PromQuery,
  updatePanelGroupInput,
} from './graphql/dashboardsDetails';

export interface PanelGroupMap {
  groupName: string;
  panels: string[];
}

export interface PromQueryExport {
  prom_query_name: string;
  legend: string;
  resolution: string;
  minstep: string;
  line: boolean;
  close_area: boolean;
}

export interface PanelExport {
  prom_queries: PromQueryExport[];
  panel_options: PanelOption;
  panel_name: string;
  y_axis_left: string;
  y_axis_right: string;
  x_axis_down: string;
  unit: string;
}

export interface PanelGroupExport {
  panel_group_name: string;
  panels: PanelExport[];
}

export interface DashboardExport {
  dashboardID: string;
  name: string;
  information: string;
  chaosEventQueryTemplate: string;
  chaosVerdictQueryTemplate: string;
  applicationMetadataMap: ApplicationMetadata[];
  panelGroupMap: PanelGroupMap[];
  panelGroups: PanelGroupExport[];
}

export interface DashboardData {
  dashboardTypeID: string;
  typeName: string;
  urlToIcon: string;
  information: string;
  urlToDashboard?: string;
  chaosEventQueryTemplate?: string;
  chaosVerdictQueryTemplate?: string;
  handleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface DashboardDetails {
  id?: string;
  name?: string;
  dashboardTypeID?: string;
  dashboardTypeName?: string;
  dataSourceType?: string;
  dataSourceID?: string;
  dataSourceURL?: string;
  chaosEventQueryTemplate?: string;
  chaosVerdictQueryTemplate?: string;
  agentID?: string;
  information?: string;
  panelGroups?: PanelGroupDetails[];
  panelGroupMap?: updatePanelGroupInput[];
  selectedPanelGroupMap?: PanelGroupMap[];
  applicationMetadataMap?: ApplicationMetadata[];
  selectedPanels?: PanelDetails[];
}

export interface DashboardConfigurationDetails {
  name: string;
  typeID: string;
  dataSourceName: string;
  dataSourceURL: string;
  agentName: string;
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
  closedAreaData: Array<GraphMetric>;
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

export interface SelectedDashboardInformation {
  id: string;
  name: string;
  typeName: string;
  typeID: string;
  agentID: string;
  agentName: string;
  urlToIcon: string;
  information: string;
  chaosEventQueryTemplate: string;
  chaosVerdictQueryTemplate: string;
  applicationMetadataMap: ApplicationMetadata[];
  dashboardListForAgent: ListDashboardResponse[];
  metaData: ListDashboardResponse[];
  dashboardKey: string;
  panelNameAndIDList: PanelNameAndID[];
}

export interface PromQueryDetails extends PromQuery {
  hidden?: boolean;
  base_query?: string;
  labels_and_values_list?: QueryLabelValue[];
}

export interface PanelDetails extends Panel {
  ds_url?: string;
  panel_group_name?: string;
  prom_queries: PromQueryDetails[];
}

export interface PanelGroupDetails extends PanelGroup {
  panels: PanelDetails[];
}

export interface QueryLabelValue {
  label: string;
  value: string[];
}
