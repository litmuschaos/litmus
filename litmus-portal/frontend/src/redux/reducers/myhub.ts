import {
  HubDetails,
  MyHubAction,
  MyHubActions,
} from '../../models/redux/myhub';
import createReducer from './createReducer';

const initialState: HubDetails = {
  id: '',
  hubName: '',
  repoURL: '',
  repoBranch: '',
  totalExp: '',
  isAvailable: true,
  isPrivate: false,
  token: '',
  userName: '',
  password: '',
  sshPrivateKey: '',
  sshPublicKey: '',
  lastSyncedAt: '',
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
