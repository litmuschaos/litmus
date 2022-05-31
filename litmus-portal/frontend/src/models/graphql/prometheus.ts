export interface promQueryInput {
  queryID: string;
  query: string;
  legend?: string;
  resolution?: string;
  minstep: number;
}

export interface promInput {
  dsDetails: dsDetails;
  queries?: promQueryInput[];
}

export interface metricsTimeStampValue {
  date: number;
  value: number;
}

export interface annotationsTimeStampValue {
  date: number;
  value: number;
}

export interface metricsPromResponse {
  queryid: string;
  legends: string[];
  tsvs: metricsTimeStampValue[][];
}

export interface subData {
  date: number;
  value: string;
  subDataName: string;
}

export interface annotationsPromResponse {
  queryid: string;
  legends: string[];
  tsvs: annotationsTimeStampValue[][];
  subDataArray: subData[][];
}

export interface promResponse {
  metricsResponse: metricsPromResponse[];
  annotationsResponse: annotationsPromResponse[];
}

export interface PrometheusQueryVars {
  request: promInput;
}

export interface PrometheusResponse {
  getPrometheusData: promResponse;
}

export interface promSeriesInput {
  series: string;
  dsDetails: dsDetails;
}

export interface Option {
  name: string;
}
export interface LabelValue {
  label: string;
  values?: Option[];
}
export interface promSeriesResponse {
  series: string;
  labelValues?: LabelValue[];
}

export interface PrometheusSeriesQueryVars {
  request: promSeriesInput;
}

export interface PrometheusSeriesResponse {
  getPromLabelNamesAndValues: promSeriesResponse;
}

export interface dsDetails {
  url: string;
  start: string;
  end: string;
}

export interface promSeriesListResponse {
  seriesList: string[];
}

export interface PrometheusSeriesListQueryVars {
  request: dsDetails;
}

export interface PrometheusSeriesListResponse {
  getPromSeriesList: promSeriesListResponse;
}

export interface dataVars {
  url: string;
  start: string;
  end: string;
  relativeTime: number;
  refreshInterval: number;
}

export interface queryMapForPanel {
  panelID: string;
  queryIDs: string[];
}

export interface queryMapForPanelGroup {
  panelGroupID: string;
  panelQueryMap: queryMapForPanel[];
}

export interface ViewDashboardInput {
  dashboardID?: string;
  promQueries: promQueryInput[];
  dashboardQueryMap: queryMapForPanelGroup[];
  dataVariables: dataVars;
}

export interface metricDataForPanel {
  panelID: string;
  panelMetricsResponse: metricsPromResponse[];
}

export interface metricDataForPanelGroup {
  panelGroupID: string;
  panelGroupMetricsResponse: metricDataForPanel[];
}

export interface dashboardPromResponse {
  dashboardMetricsResponse: metricDataForPanelGroup[];
  annotationsResponse: annotationsPromResponse[];
}

export interface ViewDashboard {
  viewDashboard: dashboardPromResponse;
}
