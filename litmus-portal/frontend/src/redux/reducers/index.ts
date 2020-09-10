import { combineReducers } from 'redux';
import { Node } from '../../models/graphql/workflowData';
import { CommunityData } from '../../models/redux/analytics';
import { TabState } from '../../models/redux/tabs';
import { UserData } from '../../models/redux/user';
import { WorkflowData } from '../../models/redux/workflow';
import * as analyticsReducer from './analytics';
import * as nodeSelectionReducer from './nodeSelection';
import * as tabsReducer from './tabs';
import * as userReducer from './user';
import * as workflowReducer from './workflow';

export interface RootState {
  communityData: CommunityData;
  userData: UserData;
  workflowData: WorkflowData;
  selectedNode: Node;
  tabNumber: TabState;
}

export default () =>
  combineReducers({
    ...analyticsReducer,
    ...userReducer,
    ...workflowReducer,
    ...nodeSelectionReducer,
    ...tabsReducer,
  });
