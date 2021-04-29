import { ParsedPrometheusData } from '../models/dashboardsData';
import { PromQuery } from '../models/graphql/dashboardsDetails';
import {
  PrometheusResponse,
  promQueryInput,
} from '../models/graphql/prometheus';
import {
  DEFAULT_CHAOS_EVENT_NAME,
  DEFAULT_METRIC_SERIES_NAME,
  PROMETHEUS_QUERY_RESOLUTION_LIMIT,
} from '../pages/MonitoringDashboardPage/constants';

export const getPromQueryInput = (
  prom_queries: PromQuery[],
  timeRangeDiff: number
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
  // promQueries.push({
  //   queryid: 'chaos-interval',
  //   query: 'litmuschaos_awaited_experiments{job="chaos-exporter"}',
  //   legend: '{{chaosengine_name}}',
  //   resolution: DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY_RESOLUTION,
  //   minstep:
  //     timeRangeDiff < PROMETHEUS_QUERY_RESOLUTION_LIMIT - 1
  //       ? 1
  //       : Math.floor(timeRangeDiff / (PROMETHEUS_QUERY_RESOLUTION_LIMIT + 1)),
  // });
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
  prometheusData.GetPromQuery.forEach((queryResponse, mainIndex) => {
    if (queryResponse.legends && queryResponse.legends[0]) {
      if (
        queryResponse.queryid === 'chaos-interval' ||
        queryResponse.queryid === 'chaos-verdict'
      ) {
        parsedPrometheusData.chaosData.push(
          ...queryResponse.legends.map((elem, index) => ({
            metricName: elem[0] ?? DEFAULT_CHAOS_EVENT_NAME,
            data: queryResponse.tsvs[index].map((dataPoint) => ({
              date: parseInt(dataPoint.timestamp ?? '0', 10) * 1000,
              value: parseInt(dataPoint.value ?? '0', 10),
            })),
            baseColor:
              areaGraph[
                (mainIndex + (index % areaGraph.length)) % areaGraph.length
              ],
            subData: [],
          }))
        );
      } else {
        parsedPrometheusData.seriesData.push(
          ...queryResponse.legends.map((elem, index) => ({
            metricName: elem[0] ?? DEFAULT_METRIC_SERIES_NAME,
            data: queryResponse.tsvs[index].map((dataPoint) => ({
              date: parseInt(dataPoint.timestamp ?? '0', 10) * 1000,
              value: parseFloat(dataPoint.value ?? '0.0'),
            })),
            baseColor:
              lineGraph[
                (mainIndex + (index % lineGraph.length)) % lineGraph.length
              ],
          }))
        );
      }
    }
  });
  return parsedPrometheusData;
};
