export interface promQueryInput {
  queryid: string;
  query: string;
  legend?: string;
  resolution?: string;
  minstep: number;
}

export interface promInput {
  ds_details: dsDetails;
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
  prometheusInput: promInput;
}

export interface PrometheusResponse {
  GetPromQuery: promResponse;
}

export interface promSeriesInput {
  series: string;
  ds_details: dsDetails;
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
  prometheusInput: promSeriesInput;
}

export interface PrometheusSeriesResponse {
  GetPromLabelNamesAndValues: promSeriesResponse;
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
  prometheusDSInput: dsDetails;
}

export interface PrometheusSeriesListResponse {
  GetPromSeriesList: promSeriesListResponse;
}

export interface dataVars {
  url: string;
  start: string;
  end: string;
  relative_time: number;
  refresh_interval: number;
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
  dbID?: string;
  prometheusQueries: promQueryInput[];
  queryMap: queryMapForPanelGroup[];
  dataVarMap: dataVars;
}

export interface metricDataForPanel {
  panelID: string;
  PanelMetricsResponse: metricsPromResponse[];
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
