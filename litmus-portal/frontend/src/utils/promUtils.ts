/* eslint-disable no-unused-expressions */
/* eslint-disable no-useless-escape */
/* eslint-disable no-param-reassign */
import {
  ParsedChaosEventPrometheusData,
  ParsedMetricPrometheusData,
  PromQueryDetails,
  QueryLabelValue,
  RangeType,
} from '../models/dashboardsData';
import { PanelGroupResponse } from '../models/graphql/dashboardsDetails';
import {
  annotationsPromResponse,
  metricsPromResponse,
  metricsTimeStampValue,
  promQueryInput,
  subData,
} from '../models/graphql/prometheus';
import {
  DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY_RESOLUTION,
  DEFAULT_RELATIVE_TIME_RANGE,
  PROMETHEUS_QUERY_RESOLUTION_LIMIT,
} from '../pages/ApplicationDashboard/constants';

const labelMatchOperators = ['==', '!=', '<=', '<', '>=', '>', '=~', '!~', '='];

export const getPromQueryInput = (
  prom_queries: PromQueryDetails[],
  timeRangeDiff: number,
  withEvents: boolean,
  eventQueryTemplate?: string,
  verdictQueryTemplate?: string
) => {
  const promQueries: promQueryInput[] = [];
  prom_queries.forEach((query: PromQueryDetails) => {
    promQueries.push({
      queryid: query.queryid,
      query: query.prom_query_name,
      legend: query.legend,
      resolution: query.resolution,
      minstep:
        Math.ceil(timeRangeDiff / parseInt(query.minstep, 10)) <
        PROMETHEUS_QUERY_RESOLUTION_LIMIT - 1
          ? parseInt(query.minstep, 10)
          : Math.ceil(timeRangeDiff / (PROMETHEUS_QUERY_RESOLUTION_LIMIT + 1)),
    });
  });
  if (withEvents && eventQueryTemplate && verdictQueryTemplate) {
    promQueries.push({
      queryid: 'chaos-event',
      query: eventQueryTemplate, // litmuschaos_awaited_experiments{job="chaos-exporter", chaos_injection_time!=""}
      legend: '{{chaosresult_name}}',
      resolution: DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY_RESOLUTION,
      minstep:
        timeRangeDiff < PROMETHEUS_QUERY_RESOLUTION_LIMIT - 1
          ? 1
          : Math.ceil(timeRangeDiff / (PROMETHEUS_QUERY_RESOLUTION_LIMIT + 1)),
    });
    promQueries.push({
      queryid: 'chaos-verdict',
      query: verdictQueryTemplate, // litmuschaos_experiment_verdict{job="chaos-exporter"}
      legend: '{{chaosresult_name}}',
      resolution: DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY_RESOLUTION,
      minstep:
        timeRangeDiff < PROMETHEUS_QUERY_RESOLUTION_LIMIT - 1
          ? 1
          : Math.ceil(timeRangeDiff / (PROMETHEUS_QUERY_RESOLUTION_LIMIT + 1)),
    });
  }
  return promQueries;
};

export const generatePromQueries = (
  range: RangeType,
  dashboardMetaPanelGroups: PanelGroupResponse[],
  chaosEventQueryTemplate: string,
  chaosVerdictQueryTemplate: string
) => {
  const timeRangeDiff: number =
    range.startDate !== ''
      ? parseInt(range.endDate, 10) - parseInt(range.startDate, 10)
      : DEFAULT_RELATIVE_TIME_RANGE;
  const promQueries: promQueryInput[] = getPromQueryInput(
    dashboardMetaPanelGroups
      .flatMap((panelGroup) => panelGroup.panels)
      .flatMap((panel) => panel.prom_queries),
    timeRangeDiff,
    true,
    chaosEventQueryTemplate,
    chaosVerdictQueryTemplate
  );
  return promQueries;
};

export const getValueFromSubDataArray = (array: subData[], key: string) => {
  let value = '';
  array.forEach((element) => {
    if (element.subDataName === key) {
      value = element.value;
    }
  });
  return value;
};

export const ChaosEventDataParserForPrometheus = (
  chaosEventData: annotationsPromResponse[],
  areaGraph: string[]
) => {
  const parsedPrometheusData: ParsedChaosEventPrometheusData = {
    chaosEventDetails: [],
    chaosData: [],
  };
  chaosEventData.forEach((queryResponse, mainIndex) => {
    if (queryResponse && queryResponse.legends && queryResponse.tsvs) {
      queryResponse.legends.forEach((elem, index) => {
        const baseColor =
          areaGraph[
            (mainIndex + (index % areaGraph.length)) % areaGraph.length
          ];
        if (queryResponse.tsvs[index]) {
          parsedPrometheusData.chaosData.push({
            metricName: elem,
            data: queryResponse.tsvs[index].map((dataPoint) => ({
              ...dataPoint,
            })),
            baseColor,
            subData: queryResponse.subDataArray[index],
          });
        }
        parsedPrometheusData.chaosEventDetails.push({
          id: elem,
          legendColor: baseColor,
          chaosResultName: elem,
          workflow: getValueFromSubDataArray(
            queryResponse.subDataArray[index],
            'Workflow'
          ),
          engineContext: getValueFromSubDataArray(
            queryResponse.subDataArray[index],
            'Engine context'
          ),
          verdict: getValueFromSubDataArray(
            queryResponse.subDataArray[index],
            'Experiment verdict'
          ),
          injectionFailed: !queryResponse.tsvs[index],
        });
      });
    }
  });
  return parsedPrometheusData;
};

export const MetricDataParserForPrometheus = (
  metricData: metricsPromResponse[],
  lineGraph: string[],
  areaGraph: string[],
  closedAreaQueryIDs: string[],
  selectedApplications?: string[]
) => {
  const parsedPrometheusData: ParsedMetricPrometheusData = {
    seriesData: [],
    closedAreaData: [],
  };
  metricData.forEach((queryResponse, mainIndex) => {
    if (queryResponse && queryResponse.legends && queryResponse.tsvs) {
      let { legends } = queryResponse;
      let { tsvs } = queryResponse;
      if (selectedApplications && selectedApplications.length) {
        const newLegends: string[] = [];
        const newTsvs: metricsTimeStampValue[][] = [];
        queryResponse.legends.forEach((legend, index) => {
          const filteredApps: string[] = selectedApplications.filter((app) =>
            legend.includes(app)
          );
          if (filteredApps.length) {
            newLegends.push(legend);
            newTsvs.push(queryResponse.tsvs[index]);
          }
        });
        legends = newLegends;
        tsvs = newTsvs;
      }
      if (closedAreaQueryIDs.includes(queryResponse.queryid)) {
        parsedPrometheusData.closedAreaData.push(
          ...legends.map((elem, index) => ({
            metricName: elem,
            data: tsvs[index].map((dataPoint) => ({
              ...dataPoint,
            })),
            baseColor:
              areaGraph[
                (mainIndex + (index % areaGraph.length)) % areaGraph.length
              ],
          }))
        );
      } else {
        parsedPrometheusData.seriesData.push(
          ...legends.map((elem, index) => ({
            metricName: elem,
            data: tsvs[index].map((dataPoint) => ({
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
  });
  return parsedPrometheusData;
};

export const replaceBetween = (
  origin: string,
  startIndex: number,
  endIndex: number,
  insertion: string
) =>
  `${origin.substring(0, startIndex)}${insertion}${origin.substring(endIndex)}`;

export const getLabelsAndValues = (queryString: string) => {
  const labelValuesList: QueryLabelValue[] = [];
  const re = /\{(.*?)\}/g;
  const arr: string[] = queryString.match(re) as string[];
  if (arr) {
    const tempLabelValueList = arr[0].split(',');
    tempLabelValueList.forEach((labelValue, index) => {
      let adjustedLabelValue = labelValue;
      if (index === 0) {
        adjustedLabelValue = adjustedLabelValue.substring(1, labelValue.length);
      }
      if (index === tempLabelValueList.length - 1) {
        adjustedLabelValue = adjustedLabelValue.substring(
          0,
          labelValue.length - 2
        );
      }
      let splitOperator = '';
      labelMatchOperators.some((val) => {
        const ret = adjustedLabelValue.indexOf(val) !== -1;
        if (ret) {
          splitOperator = val;
        }
        return ret;
      });
      const labelAndValue = adjustedLabelValue.trim().split(splitOperator);
      const re1 = /\"(.*?)\"/g;
      if (labelAndValue.length > 0 && labelAndValue[1]) {
        const arr1: string[] = labelAndValue[1].match(re1) as string[];
        if (arr1 && arr1.length > 0) {
          let updateStatus = false;
          labelValuesList.forEach((labVal) => {
            if (labVal.label === labelAndValue[0]) {
              labVal.value = labVal.value.concat(
                arr1[0].substring(1, arr1[0].length - 1).split('|')
              );
              updateStatus = true;
            }
          });
          if (!updateStatus) {
            labelValuesList.push({
              label: labelAndValue[0],
              value: arr1[0].substring(1, arr1[0].length - 1).split('|'),
            });
          }
        }
      }
    });
  }
  return labelValuesList;
};

export const setLabelsAndValues = (
  baseQueryString: string,
  queryString: string,
  labelValuesList: QueryLabelValue[]
) => {
  let existingQueryString: string = queryString;
  labelValuesList.forEach((labVal) => {
    const matchBracketIndex = existingQueryString.indexOf('{');
    let matchLabelIndex = -1;
    if (matchBracketIndex !== -1) {
      matchLabelIndex = existingQueryString.indexOf(
        labVal.label,
        matchBracketIndex
      );
    }
    if (matchLabelIndex === -1) {
      if (matchBracketIndex === -1) {
        const baseConcatIndex =
          queryString.indexOf(baseQueryString) + baseQueryString.length - 1;
        existingQueryString = `${existingQueryString.slice(
          0,
          baseConcatIndex + 1
        )}{${labVal.label}=~"${labVal.value.join(
          '|'
        )}"}${existingQueryString.slice(baseConcatIndex + 1)}`;
      } else {
        existingQueryString = `${existingQueryString.slice(
          0,
          matchBracketIndex + 1
        )}${labVal.label}=~"${labVal.value.join(
          '|'
        )}",${existingQueryString.slice(matchBracketIndex + 1)}`;
      }
    } else {
      const lastIndexOfOpr = existingQueryString.indexOf(`"`, matchLabelIndex);
      const lastIndexOfVal = existingQueryString.indexOf(
        `"`,
        lastIndexOfOpr + 1
      );
      const subStrToReplace = existingQueryString.substring(
        lastIndexOfOpr,
        lastIndexOfVal + 1
      );
      if (lastIndexOfOpr !== -1 && lastIndexOfVal !== -1) {
        if (labVal.value.length) {
          existingQueryString = existingQueryString.replace(
            subStrToReplace,
            `"${labVal.value.join('|')}"`
          );
          existingQueryString = replaceBetween(
            existingQueryString,
            matchLabelIndex + labVal.label.length,
            lastIndexOfOpr,
            '=~'
          );
        } else {
          const graceIndexForBrackets =
            (existingQueryString[lastIndexOfVal + 1] === '}' ||
              existingQueryString[lastIndexOfVal + 2] === '}') &&
            existingQueryString[matchLabelIndex - 1] === '{'
              ? 1
              : 0;
          existingQueryString = existingQueryString.replace(
            existingQueryString.substring(
              matchLabelIndex - graceIndexForBrackets,
              existingQueryString[lastIndexOfVal + 1] === ','
                ? lastIndexOfVal + 2 + graceIndexForBrackets
                : lastIndexOfVal + 1 + graceIndexForBrackets
            ),
            ``
          );
        }
      }
    }
  });
  return existingQueryString;
};
