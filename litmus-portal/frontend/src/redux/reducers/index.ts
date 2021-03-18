import { combineReducers } from 'redux';
import { AlertData } from '../../models/redux/alert';
import { AnalyticsData } from '../../models/redux/analytics';
import { InfoButtonData } from '../../models/redux/button';
import { DashboardData } from '../../models/redux/dashboards';
import { DataSourceData } from '../../models/redux/dataSource';
import { HubDetails } from '../../models/redux/myhub';
import { SelectedNode } from '../../models/redux/nodeSelection';
import { TabState } from '../../models/redux/tabs';
import { TemplateData } from '../../models/redux/template';
import { UserData } from '../../models/redux/user';
import { WorkflowData, WorkflowManifest } from '../../models/redux/workflow';
import * as alertReducer from './alert';
import * as analyticsReducer from './analytics';
import * as infoButtonReducer from './button';
import * as dashboardReducer from './dashboards';
import * as dataSourceReducer from './dataSource';
import * as hubDetails from './myhub';
import * as nodeSelectionReducer from './nodeSelection';
import * as tabsReducer from './tabs';
import * as templateReducer from './template';
import * as userReducer from './user';
import * as workflowReducer from './workflow';

export interface RootState {
  communityData: AnalyticsData;
  userData: UserData;
  workflowData: WorkflowData;
  workflowManifest: WorkflowManifest;
  selectedNode: SelectedNode;
  toggleInfoButton: InfoButtonData;
  tabNumber: TabState;
  alert: AlertData;
  selectTemplate: TemplateData;
  hubDetails: HubDetails;
  selectDataSource: DataSourceData;
  selectDashboard: DashboardData;
}

export default () =>
  combineReducers({
    ...analyticsReducer,
    ...userReducer,
    ...workflowReducer,
    ...nodeSelectionReducer,
    ...tabsReducer,
    ...alertReducer,
    ...templateReducer,
    ...infoButtonReducer,
    ...hubDetails,
    ...dataSourceReducer,
    ...dashboardReducer,
  });
