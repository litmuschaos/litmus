import {
  MyHubAction,
  MyHubActions,
  HubDetails,
} from '../../models/redux/myhub';
import createReducer from './createReducer';

const initialState: HubDetails = {
  id: '',
  HubName: '',
  RepoURL: '',
  RepoBranch: '',
  TotalExp: '',
  IsAvailable: true,
  IsPrivate: false,
  Token: '',
  UserName: '',
  Password: '',
  SSHPrivateKey: '',
  SSHPublicKey: '',
  LastSyncedAt: '',
};

export const hubDetails = createReducer<HubDetails>(initialState, {
  [MyHubActions.SET_MYHUB](state: HubDetails, action: MyHubAction) {
    return {
      ...state,
      ...(action.payload as Object),
    };
  },
});

export default hubDetails;
