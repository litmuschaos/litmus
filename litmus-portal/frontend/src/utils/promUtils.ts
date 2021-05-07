/* eslint-disable no-unused-expressions */
import { ParsedPrometheusData } from '../models/dashboardsData';
import { PromQuery } from '../models/graphql/dashboardsDetails';
import {
  PrometheusResponse,
  promQueryInput,
} from '../models/graphql/prometheus';
import {
  DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY_RESOLUTION,
  PROMETHEUS_QUERY_RESOLUTION_LIMIT,
} from '../pages/MonitoringDashboardPage/constants';

export const getPromQueryInput = (
  prom_queries: PromQuery[],
  timeRangeDiff: number,
  withEvents: Boolean
) => {
  const promQueries: promQueryInput[] = [];
  prom_queries.forEach((query: PromQuery) => {
    promQueries.push({
      queryid: query.queryid,
      query: query.prom_query_name,
      legend: query.legend,
      resolution: query.resolution,
      minstep:
        Math.floor(timeRangeDiff / parseInt(query.minstep, 10)) *
          prom_queries.length <
        PROMETHEUS_QUERY_RESOLUTION_LIMIT - 1
          ? parseInt(query.minstep, 10)
          : Math.floor(
              (timeRangeDiff * prom_queries.length) /
                (PROMETHEUS_QUERY_RESOLUTION_LIMIT + 1)
            ),
    });
  });
  if (withEvents) {
    promQueries.push({
      queryid: 'chaos-interval',
      query: 'litmuschaos_awaited_experiments{job="chaos-exporter"}',
      legend: '{{chaosengine_name}}',
      resolution: DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY_RESOLUTION,
      minstep:
        timeRangeDiff < PROMETHEUS_QUERY_RESOLUTION_LIMIT - 1
          ? 1
          : Math.floor(timeRangeDiff / (PROMETHEUS_QUERY_RESOLUTION_LIMIT + 1)),
    });
    // promQueries.push({
    //   queryid: 'chaos-verdict',
    //   query: 'litmuschaos_experiment_verdict{job="chaos-exporter"}',
    //   legend: '{{chaosengine_name}}',
    //   resolution: DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY_RESOLUTION,
    //   minstep:
    //     timeRangeDiff < PROMETHEUS_QUERY_RESOLUTION_LIMIT - 1
    //       ? 1
    //       : Math.floor(timeRangeDiff / (PROMETHEUS_QUERY_RESOLUTION_LIMIT + 1)),
    // });
  }
  return promQueries;
};

export const DataParserForPrometheus = (
  prometheusData: PrometheusResponse,
  lineGraph: string[],
  areaGraph: string[]
) => {
  const parsedPrometheusData: ParsedPrometheusData = {
    seriesData: [],
    chaosData: [],
  };
  prometheusData.GetPromQuery.annotationsResponse?.forEach(
    (queryResponse, mainIndex) => {
      if (queryResponse && queryResponse.legends) {
        parsedPrometheusData.chaosData.push(
          ...queryResponse.legends?.map((elem, index) => ({
            metricName: elem,
            data: queryResponse.tsvs[index]?.map((dataPoint) => ({
              ...dataPoint,
            })),
            baseColor:
              areaGraph[
                (mainIndex + (index % areaGraph.length)) % areaGraph.length
              ],
            subData: [],
          }))
        );
      }
    }
  );
  prometheusData.GetPromQuery.metricsResponse?.forEach(
    (queryResponse, mainIndex) => {
      if (queryResponse && queryResponse.legends) {
        parsedPrometheusData.seriesData.push(
          ...queryResponse.legends?.map((elem, index) => ({
            metricName: elem,
            data: queryResponse.tsvs[index]?.map((dataPoint) => ({
              ...dataPoint,
            })),
            baseColor:
              lineGraph[
                (mainIndex + (index % lineGraph.length)) % lineGraph.length
              ],
          }))
        );
      }
    }
  );
  return parsedPrometheusData;
};
