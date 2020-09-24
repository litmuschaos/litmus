/* eslint-disable import/prefer-default-export */
import config from '../../config';
import { AnalyticsActions } from '../../models/redux/analytics';

export const loadCommunityAnalytics = () => (dispatch: Function) => {
  fetch(`${config.analytics.url}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      dispatch({
        type: AnalyticsActions.LOAD_COMMUNITY_ANALYTICS,
        payload: data,
      });
    })
    .catch(() => {
      dispatch({
        type: AnalyticsActions.LOAD_COMMUNITY_ANALYTICS,
        payload: {},
      });
    });
};
