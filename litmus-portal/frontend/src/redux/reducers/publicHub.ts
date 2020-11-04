import {
  Chart,
  MyHubAction,
  MyHubActions,
  PublicHubData,
} from '../../models/redux/myhub';
import createReducer from './createReducer';

const initialState: PublicHubData = {
  charts: [],
};

export const publicHubDetails = createReducer<PublicHubData>(initialState, {
  [MyHubActions.LOAD_PUBLIC_CHARTS](state: PublicHubData, action: MyHubAction) {
    return {
      ...state,
      charts: action.payload as Chart[],
    };
  },
});

export default publicHubDetails;
