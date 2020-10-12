import {
  AnalyticsAction,
  AnalyticsActions,
  AnalyticsData,
  CommunityData,
  GeoCity,
  SeriesData,
} from '../../models/redux/analytics';
import createReducer from './createReducer';

const initialState: AnalyticsData = {
  communityData: {
    github: { stars: '', experimentsCount: '' },
    google: {
      totalRuns: '',
      operatorInstalls: '',
      geoCity: [],
      geoCountry: [],
      dailyExperimentData: [],
      dailyOperatorData: [],
      monthlyExperimentData: [],
      monthlyOperatorData: [],
    },
  },
  loading: false,
  error: false,
};

export const communityData = createReducer<AnalyticsData>(initialState, {
  [AnalyticsActions.COMMUNITY_ANALYTICS_SUCCESS](
    state: AnalyticsData,
    action: AnalyticsAction
  ) {
    const data = action.payload as CommunityData;
    const geoCity: GeoCity[] = [];
    data.google.geoCity.forEach((c: any) => {
      geoCity.push({
        name: c[0],
        latitude: c[1],
        longitude: c[2],
        count: c[3],
      });
    });

    const { geoCountry } = data.google;

    const dailyExperimentData: SeriesData[] = [];
    data.google.dailyExperimentData.forEach((c: any) => {
      dailyExperimentData.push({
        date: c[0],
        count: c[1],
      });
    });

    const dailyOperatorData: SeriesData[] = [];
    data.google.dailyOperatorData.forEach((c: any) => {
      dailyOperatorData.push({
        date: c[0],
        count: c[1],
      });
    });

    const monthlyExperimentData: SeriesData[] = [];
    data.google.monthlyExperimentData.forEach((c: any) => {
      monthlyExperimentData.push({
        date: c[0],
        count: c[1],
      });
    });

    const monthlyOperatorData: SeriesData[] = [];
    data.google.monthlyOperatorData.forEach((c: any) => {
      monthlyOperatorData.push({
        date: c[0],
        count: c[1],
      });
    });

    return {
      ...state,
      communityData: {
        github: data.github,
        google: {
          totalRuns: data.google.totalRuns,
          operatorInstalls: data.google.operatorInstalls,
          geoCountry,
          geoCity,
          dailyExperimentData,
          dailyOperatorData,
          monthlyExperimentData,
          monthlyOperatorData,
        },
      },
      loading: false,
      error: false,
    };
  },
  [AnalyticsActions.COMMUNITY_ANALYTICS_LOADING](
    state: AnalyticsData,
    action: AnalyticsAction
  ) {
    return {
      ...state,
      loading: action.payload as boolean,
    };
  },
  [AnalyticsActions.COMMUNITY_ANALYTICS_ERROR](
    state: AnalyticsData,
    action: AnalyticsAction
  ) {
    return {
      ...state,
      loading: false,
      error: action.payload as boolean,
    };
  },
});

export default communityData;
