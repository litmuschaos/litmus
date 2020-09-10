import { combineReducers } from 'redux';
import { Node } from '../../models/graphql/workflowData';
import { CommunityData } from '../../models/redux/analytics';
import { UserData } from '../../models/redux/user';
import { WorkflowData } from '../../models/redux/workflow';
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
