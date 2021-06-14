import { ApplicationMetadata } from '../graphql/dashboardsDetails';

interface PanelGroupMetadata {
  groupName: string;
  panels: string[];
}

interface PromQuery {
  prom_query_name: string;
  legend: string;
  resolution: string;
  minstep: string;
  line: boolean;
  close_area: boolean;
}

interface Panel {
  panel_name: string;
  panel_options: {
    points: boolean;
    grids: boolean;
    left_axis: boolean;
  };
  y_axis_left: string;
  y_axis_right: string;
  x_axis_down: string;
  unit: string;
  prom_queries: PromQuery[];
}

interface PanelGroup {
  panel_group_name: string;
  panels: Panel[];
}

export interface ApplicationDashboard {
  dashboardID: string;
  name: string;
  information: string;
  chaosEventQueryTemplate: string;
  chaosVerdictQueryTemplate: string;
  applicationMetadataMap: ApplicationMetadata[];
  panelGroupMap: PanelGroupMetadata[];
  panelGroups: PanelGroup[];
}

export interface RangeType {
  startDate: string;
  endDate: string;
}

export interface DashboardData {
  dashboardJSON: any;
  selectedDashboardID: string;
  activePanelID: string;
  refreshRate: number;
  range: RangeType;
  forceUpdate: Boolean;
}

export enum DashboardSelectionActions {
  SELECT_DASHBOARD = 'SELECT_DASHBOARD',
}

interface DashboardSelectionActionType<T, P> {
  type: T;
  payload: P;
}

export type DashboardSelectionAction = DashboardSelectionActionType<
  typeof DashboardSelectionActions.SELECT_DASHBOARD,
  DashboardData
>;
