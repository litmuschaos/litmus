import { TabAction, TabActions } from '../../models/redux/tabs';

export function changeWorkflowsTabs(tabNumber: number): TabAction {
  return {
    type: TabActions.CHANGE_WORKFLOWS_TAB,
    payload: tabNumber,
  };
}

export function changeSettingsTabs(tabNumber: number): TabAction {
  return {
    type: TabActions.CHANGE_SETTINGS_TAB,
    payload: tabNumber,
  };
}

export function changeWorkflowDetailsTabs(tabNumber: number): TabAction {
  return {
    type: TabActions.CHANGE_WORKFLOW_DETAILS_TAB,
    payload: tabNumber,
  };
}

export function changeAnalyticsDashboardTabs(tabNumber: number): TabAction {
  return {
    type: TabActions.CHANGE_ANALYTICS_DASHBOARD_TAB,
    payload: tabNumber,
  };
}

export function changeHubTabs(tabNumber: number): TabAction {
  return {
    type: TabActions.CHANGE_HUB_TABS,
    payload: tabNumber,
  };
}
