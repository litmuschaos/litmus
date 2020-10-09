/* eslint-disable import/prefer-default-export */
import config from '../../config';
import { AnalyticsActions } from '../../models/redux/analytics';

export const loadCommunityAnalytics = () => (dispatch: Function) => {
  dispatch({
    type: AnalyticsActions.COMMUNITY_ANALYTICS_LOADING,
    payload: true,
  });
  fetch(`${config.analytics.url}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      dispatch({
        type: AnalyticsActions.COMMUNITY_ANALYTICS_SUCCESS,
        payload: data,
      });
    })
    .catch(() => {
      dispatch({
        type: AnalyticsActions.COMMUNITY_ANALYTICS_ERROR,
        payload: true,
      });
    });
};
