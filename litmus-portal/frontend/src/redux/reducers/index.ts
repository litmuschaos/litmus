import { History } from 'history'; // eslint-disable-line import/no-extraneous-dependencies
import { combineReducers } from 'redux';
import { CommunityData } from '../../models/analytics';
import { UserData } from '../../models/user';
import { WorkflowData } from '../../models/workflow';
import * as analyticsReducer from './analytics';
import * as userReducer from './user';
import * as workflowReducer from './workflow';

export interface RootState {
  communityData: CommunityData;
  userData: UserData;
  workflowData: WorkflowData;
}

export default (
  history: History // eslint-disable-line @typescript-eslint/no-unused-vars
) =>
  combineReducers({
    ...analyticsReducer,
    ...userReducer,
    ...workflowReducer,
  });
