export enum AnalyticsActions {
  COMMUNITY_ANALYTICS_SUCCESS = 'LOAD_COMMUNITY_ANALYTICS',
  COMMUNITY_ANALYTICS_LOADING = 'COMMUNITY_ANALYTICS_LOADING',
  COMMUNITY_ANALYTICS_ERROR = 'COMMUNITY_ANALYTICS_ERROR',
}

export interface Github {
  stars: string;
  experimentsCount: string;
}

export interface GeoCity {
  name: string;
  latitude: string;
  longitude: string;
  count: string;
}

export interface SeriesData {
  date: string;
  count: string;
}

export interface Google {
  totalRuns: string;
  operatorInstalls: string;
  geoCity: GeoCity[];
  geoCountry: string[][];
  dailyOperatorData: SeriesData[];
  dailyExperimentData: SeriesData[];
  monthlyOperatorData: SeriesData[];
  monthlyExperimentData: SeriesData[];
}

export interface CommunityData {
  github: Github;
  google: Google;
}

export interface AnalyticsData {
  communityData: CommunityData;
  loading: boolean;
  error: boolean;
}

interface AnalyticsActionType<T, P> {
  type: T;
  payload: P;
}

export type AnalyticsAction =
  | AnalyticsActionType<
      typeof AnalyticsActions.COMMUNITY_ANALYTICS_SUCCESS,
      CommunityData
    >
  | AnalyticsActionType<
      typeof AnalyticsActions.COMMUNITY_ANALYTICS_LOADING,
      boolean
    >
  | AnalyticsActionType<
      typeof AnalyticsActions.COMMUNITY_ANALYTICS_ERROR,
      boolean
    >;
