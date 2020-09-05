import { combineReducers } from 'redux';
import { CommunityData } from '../../models/analytics';
import { UserData } from '../../models/user';
import { WorkflowData } from '../../models/workflow';
import { Node } from '../../models/workflowData';
import * as analyticsReducer from './analytics';
import * as nodeSelectionReducer from './nodeSelection';
import * as userReducer from './user';
import * as workflowReducer from './workflow';

export interface RootState {
  communityData: CommunityData;
  userData: UserData;
  workflowData: WorkflowData;
  selectedNode: Node;
}

export default () =>
  combineReducers({
    ...analyticsReducer,
    ...userReducer,
    ...workflowReducer,
    ...nodeSelectionReducer,
  });
