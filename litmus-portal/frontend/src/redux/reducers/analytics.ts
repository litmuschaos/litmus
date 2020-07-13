import createReducer from './createReducer';
import {
  CommunityData,
  AnalyticsAction,
  AnalyticsActions,
  GeoCity,
  SeriesData,
} from '../../models';

const initialState: CommunityData = {
  github: { stars: '', experimentsCount: '' },
  google: {
    totalRuns: '',
    operatorInstalls: '',
    geoCity: [],
    geoCountry: [],
    dailyExperimentData: [],
    dailyOperatorData: [],
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

    const geoCountry: string[][] = data.google.geoCountry;

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
      },
    };
  },
});

export default communityData;
