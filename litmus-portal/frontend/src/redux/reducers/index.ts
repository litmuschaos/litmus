import { combineReducers } from 'redux';
import { AlertData } from '../../models/redux/alert';
import { AnalyticsData } from '../../models/redux/analytics';
import { DashboardData } from '../../models/redux/dashboards';
import { DataSourceData } from '../../models/redux/dataSource';
import { ImageRegistryInfo } from '../../models/redux/image_registry';
import { HubDetails } from '../../models/redux/myhub';
import { SelectedNode } from '../../models/redux/nodeSelection';
import { TabState } from '../../models/redux/tabs';
import { TemplateData } from '../../models/redux/template';
import {
  LitmusCoreVersion,
  WorkflowData,
  WorkflowManifest,
} from '../../models/redux/workflow';
import * as alertReducer from './alert';
import * as analyticsReducer from './analytics';
import * as dashboardReducer from './dashboards';
import * as dataSourceReducer from './dataSource';
import * as imageRegistryReducer from './image_registry';
import * as hubDetails from './myhub';
import * as nodeSelectionReducer from './nodeSelection';
import * as tabsReducer from './tabs';
import * as templateReducer from './template';
import * as workflowReducer from './workflow';

export interface RootState {
  communityData: AnalyticsData;
  workflowData: WorkflowData;
  workflowManifest: WorkflowManifest;
  selectedNode: SelectedNode;
  tabNumber: TabState;
  alert: AlertData;
  selectTemplate: TemplateData;
  hubDetails: HubDetails;
  selectDataSource: DataSourceData;
  selectDashboard: DashboardData;
  selectedImageRegistry: ImageRegistryInfo;
  litmusCoreVersion: LitmusCoreVersion;
}

export default () =>
  combineReducers({
    ...analyticsReducer,
    ...workflowReducer,
    ...nodeSelectionReducer,
    ...tabsReducer,
    ...alertReducer,
    ...templateReducer,
    ...hubDetails,
    ...dataSourceReducer,
    ...imageRegistryReducer,
    ...dashboardReducer,
  });
