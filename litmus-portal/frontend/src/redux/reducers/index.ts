import { History } from 'history'; // eslint-disable-line import/no-extraneous-dependencies
import { combineReducers } from 'redux';
import { CommunityData } from '../../models';
import * as analyticsReducer from './analytics';
import * as userReducer from './user';
import { UserData } from '../../models/user';

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
