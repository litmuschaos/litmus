import { combineReducers } from 'redux';
import { Node } from '../../models/graphql/workflowData';
import { CommunityData } from '../../models/redux/analytics';
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

export interface RootState {
  communityData: CommunityData;
  userData: UserData;
  workflowData: WorkflowData;
  selectedNode: Node;
  tabNumber: TabState;
  selectTemplate: TemplateData;
}

export default () =>
  combineReducers({
    ...analyticsReducer,
    ...userReducer,
    ...workflowReducer,
    ...nodeSelectionReducer,
    ...tabsReducer,
    ...templateReducer,
  });
