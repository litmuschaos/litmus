export interface TabState {
  workflows: number;
  settings: number;
  node: number;
  analytics: number;
  overviewDashboard: number;
}

export enum TabActions {
  CHANGE_WORKFLOWS_TAB = 'CHANGE_WORKFLOWS_TAB',
  CHANGE_SETTINGS_TAB = 'CHANGE_SETTINGS_TAB',
  CHANGE_WORKFLOW_DETAILS_TAB = 'CHANGE_WORKFLOW_DETAILS_TAB',
  CHANGE_ANALYTICS_DASHBOARD_TAB = 'CHANGE_ANALYTICS_DASHBOARD_TAB',
  CHANGE_OVERVIEW_DASHBOARD_TAB = 'CHANGE_OVERVIEW_DASHBOARD_TAB',
}

interface TabActionType<T, P> {
  type: T;
  payload: P;
}

export type TabAction =
  | TabActionType<typeof TabActions.CHANGE_WORKFLOWS_TAB, number>
  | TabActionType<typeof TabActions.CHANGE_SETTINGS_TAB, number>
  | TabActionType<typeof TabActions.CHANGE_WORKFLOW_DETAILS_TAB, number>
  | TabActionType<typeof TabActions.CHANGE_ANALYTICS_DASHBOARD_TAB, number>
  | TabActionType<typeof TabActions.CHANGE_OVERVIEW_DASHBOARD_TAB, number>;
