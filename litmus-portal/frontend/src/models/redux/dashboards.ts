export interface PanelGroupMap {
  groupName: string;
  panels: string[];
}

export interface RangeType {
  startDate: string;
  endDate: string;
}

export interface DashboardData {
  selectedDashboardID: string;
  selectedDashboardName?: string;
  selectedDashboardTemplateID?: number;
  selectedDashboardTemplateName?: string;
  selectedDashboardDescription?: string;
  selectedDashboardPanelGroupMap?: PanelGroupMap[];
  selectedAgentID?: string;
  selectedAgentName?: string;
  refreshRate?: number;
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
