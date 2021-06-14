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

export interface annotationsPromResponse {
  queryid: string;
  legends: string[];
  tsvs: annotationsTimeStampValue[][];
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
