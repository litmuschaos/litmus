import {
  AnalyticsAction,
  AnalyticsActions,
  CommunityData,
  GeoCity,
  SeriesData,
} from '../../models/redux/analytics';
import createReducer from './createReducer';

const initialState: CommunityData = {
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
};

export const communityData = createReducer<CommunityData>(initialState, {
  [AnalyticsActions.LOAD_COMMUNITY_ANALYTICS](
    state: CommunityData,
    action: AnalyticsAction
  ) {
    const data = action.payload;
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
    };
  },
});

export default communityData;
