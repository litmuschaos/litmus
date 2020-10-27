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

export const getAllPublicCharts = () => (dispatch: Function) => {
  fetch('https://hub.litmuschaos.io/api/charts/1.9.0')
    .then((response) => response.json())
    .then((data) => {
      dispatch({
        type: MyHubActions.LOAD_PUBLIC_CHARTS,
        payload: data,
      });
    })
    .catch((error) => {
      console.error('Cant load data', error);
      dispatch({
        type: MyHubActions.LOAD_PUBLIC_CHARTS,
        payload: [],
      });
    });
};
