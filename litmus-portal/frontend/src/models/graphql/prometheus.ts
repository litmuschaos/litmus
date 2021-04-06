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

export interface timeStampValue {
  timestamp?: string;
  value?: string;
}

export interface promResponse {
  queryid: string;
  legends: string[][];
  tsvs: timeStampValue[][];
}

export interface PrometheusQueryVars {
  prometheusInput: promInput;
}

export interface PrometheusResponse {
  GetPromQuery: promResponse[];
}
