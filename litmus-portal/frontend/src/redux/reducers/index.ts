import { History } from 'history'; // eslint-disable-line import/no-extraneous-dependencies
import { combineReducers } from 'redux';
import { CommunityData } from '../../models/analytics';
import { UserData } from '../../models/user';
import * as analyticsReducer from './analytics';
import * as userReducer from './user';

export interface RootState {
  communityData: CommunityData;
  userData: UserData;
}

export default (
  history: History // eslint-disable-line @typescript-eslint/no-unused-vars
) =>
  combineReducers({
    ...analyticsReducer,
    ...userReducer,
  });
