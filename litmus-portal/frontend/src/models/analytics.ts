export enum AnalyticsActions {
  LOAD_COMMUNITY_ANALYTICS = 'LOAD_COMMUNITY_ANALYTICS',
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

interface AnalyticsActionType<T, P> {
  type: T;
  payload: P;
}

export type AnalyticsAction = AnalyticsActionType<
  typeof AnalyticsActions.LOAD_COMMUNITY_ANALYTICS,
  CommunityData
>;
