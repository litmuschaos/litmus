import { combineReducers } from 'redux';
import { AnalyticsData } from '../../models/redux/analytics';
import { SelectedNode } from '../../models/redux/nodeSelection';
import { TabState } from '../../models/redux/tabs';
import { TemplateData } from '../../models/redux/template';
import { UserData } from '../../models/redux/user';
import { WorkflowData } from '../../models/redux/workflow';
import * as analyticsReducer from './analytics';
import * as nodeSelectionReducer from './nodeSelection';
import * as tabsReducer from './tabs';
import * as templateReducer from './template';
import * as userReducer from './user';
import * as workflowReducer from './workflow';
import * as hubDetails from './myhub';
import { HubDetails } from '../../models/redux/myhub';

export interface RootState {
  communityData: AnalyticsData;
  userData: UserData;
  workflowData: WorkflowData;
  selectedNode: SelectedNode;
  tabNumber: TabState;
  selectTemplate: TemplateData;
  hubDetails: HubDetails;
}

export default () =>
  combineReducers({
    ...analyticsReducer,
    ...userReducer,
    ...workflowReducer,
    ...nodeSelectionReducer,
    ...tabsReducer,
    ...templateReducer,
    ...hubDetails,
  });
