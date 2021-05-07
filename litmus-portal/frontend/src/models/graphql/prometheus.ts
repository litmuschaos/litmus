export interface promQueryInput {
  queryid: string;
  query: string;
  legend?: string;
  resolution?: string;
  minstep: number;
}

export interface promInput {
  url: string;
  start: string;
  end: string;
  queries?: promQueryInput[];
}

export interface PrometheusQueryInput {
  url: string;
  start: string;
  end: string;
  queries: promQueryInput[];
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
  url: string;
  start: string;
  end: string;
}

export interface LabelValue {
  label: string;
  values?: string[];
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
