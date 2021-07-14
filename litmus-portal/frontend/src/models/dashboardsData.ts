import { BrushPostitionProps, GraphMetric } from 'litmus-ui';
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
import { promQueryInput } from './graphql/prometheus';

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
  dashboardJSON?: string;
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
  typeName: string;
  dataSourceName: string;
  dataSourceURL: string;
  agentName: string;
}

export interface PanelNameAndID {
  name: string;
  id: string;
}

export interface QueryMapForPanel {
  panelID: string;
  metricDataForPanel: ParsedMetricPrometheusData;
}

export interface QueryMapForPanelGroup {
  panelGroupID: string;
  metricDataForGroup: QueryMapForPanel[];
}

export interface GraphPanelProps extends PanelResponse {
  className?: string;
  metricDataForPanel?: ParsedMetricPrometheusData;
  chaosData?: Array<GraphMetric>;
  centralBrushPosition?: BrushPostitionProps;
  handleCentralBrushPosition: (newBrushPosition: BrushPostitionProps) => void;
  centralAllowGraphUpdate: boolean;
}

export interface GraphPanelGroupProps extends PanelGroupResponse {
  selectedPanels?: string[];
  metricDataForGroup?: QueryMapForPanel[];
  chaosData?: Array<GraphMetric>;
  centralBrushPosition?: BrushPostitionProps;
  handleCentralBrushPosition: (newBrushPosition: BrushPostitionProps) => void;
  centralAllowGraphUpdate: boolean;
}

export interface ParsedMetricPrometheusData {
  seriesData: Array<GraphMetric>;
  closedAreaData: Array<GraphMetric>;
}

export interface ParsedChaosEventPrometheusData {
  chaosEventDetails: ChaosEventDetails[];
  chaosData: Array<GraphMetric>;
}

export interface ChaosEventDetails {
  id: string;
  legendColor: string;
  chaosResultName: string;
  workflow: string;
  engineContext: string;
  verdict: string;
  injectionFailed: boolean;
}

export interface RangeType {
  startDate: string;
  endDate: string;
}

interface TimeControlObject {
  range: RangeType;
  relativeTime: number;
  refreshInterval: number;
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
  metaData: ListDashboardResponse | undefined;
  closedAreaQueryIDs: string[];
  dashboardKey: string;
  panelNameAndIDList: PanelNameAndID[];
  dataSourceURL: string;
  dataSourceID: string;
  dataSourceName: string;
  promQueries: promQueryInput[];
  range: RangeType;
  relativeTime: number;
  refreshInterval: number;
  timeControlStack: TimeControlObject[];
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
