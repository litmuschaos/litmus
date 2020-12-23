/* eslint-disable import/prefer-default-export */
import {
  HubDetails,
  MyHubAction,
  MyHubActions,
} from '../../models/redux/myhub';

export function setHubDetails(selectedHub: HubDetails): MyHubAction {
  return {
    type: MyHubActions.SET_MYHUB,
    payload: selectedHub,
  };
}
