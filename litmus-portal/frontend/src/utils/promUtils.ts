/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-loop-func */
/* eslint-disable no-console */
/* eslint-disable max-len */
import { GraphMetric } from 'litmus-ui';
import { v4 as uuidv4 } from 'uuid';
import YAML from 'yaml';
import DashboardListData from '../components/PreconfiguredDashboards/data';
import {
  Artifact,
  CronWorkflowYaml,
  Parameter,
  Template,
  WorkflowYaml,
} from '../models/chaosWorkflowYaml';
import {
  ChaosDataUpdates,
  ChaosEventDetails,
  ChaosInformation,
  ChaosResultNamesAndNamespacesMap,
  ExperimentNameAndChaosDataMap,
  RunWiseChaosMetrics,
  WorkflowAndExperimentMetaDataMap,
  WorkflowRunWiseDetails,
} from '../models/dashboardsData';
import { PromQuery } from '../models/graphql/dashboardsDetails';
import {
  PrometheusResponse,
  promQueryInput,
} from '../models/graphql/prometheus';
import {
  ChaosData,
  ExecutionData,
  Workflow,
  WorkflowList,
  WorkflowRun,
} from '../models/graphql/workflowListData';
import {
  DEFAULT_CHAOS_EVENT_NAME,
  DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY_RESOLUTION,
  DEFAULT_METRIC_SERIES_NAME,
  INVALID_RESILIENCE_SCORE_STRING,
  PROMETHEUS_QUERY_RESOLUTION_LIMIT,
  STATUS_RUNNING,
} from '../pages/MonitoringDashboardPage/constants';
import { validateWorkflowParameter } from './validate';
import { generateChaosQuery, getWorkflowParameter } from './yamlUtils';

export const getResultNameAndNamespace = (chaosQueryString: string) => {
  const parsedChaosInfoMap: ChaosResultNamesAndNamespacesMap = {
    resultName: chaosQueryString
      .split(',')[0]
      .trim()
      .split('=')[1]
      .slice(1, -1),
    resultNamespace: chaosQueryString
      .split(',')[1]
      .trim()
      .split('=')[1]
      .slice(1, -1),
    workflowName: '',
    experimentName: '',
    selectedWorkflowIds: [],
  };
  return parsedChaosInfoMap;
};

export const getWorkflowRunWiseDetails = (schedule: Workflow) => {
  const workflowRunWiseDetailsForSchedule: WorkflowRunWiseDetails = {
    idsOfWorkflowRuns: [],
    resilienceScoreForWorkflowRuns: [],
    statusOfWorkflowRuns: [],
    experimentNameWiseChaosDataOfWorkflowRuns: [],
  };
  if (schedule.workflow_runs) {
    schedule.workflow_runs.forEach((data: WorkflowRun, runIndex) => {
      try {
        const executionData: ExecutionData = JSON.parse(data.execution_data);
        workflowRunWiseDetailsForSchedule.idsOfWorkflowRuns[runIndex] =
          data.workflow_run_id;
        workflowRunWiseDetailsForSchedule.statusOfWorkflowRuns[runIndex] =
          executionData.finishedAt.length === 0
            ? STATUS_RUNNING
            : executionData.phase;
        const { nodes } = executionData;
        for (const key of Object.keys(nodes)) {
          const node = nodes[key];
          if (node.chaosData) {
            const { chaosData } = node;
            if (
              !workflowRunWiseDetailsForSchedule
                .experimentNameWiseChaosDataOfWorkflowRuns[runIndex]
            ) {
              workflowRunWiseDetailsForSchedule.experimentNameWiseChaosDataOfWorkflowRuns[
                runIndex
              ] = [];
            }
            workflowRunWiseDetailsForSchedule.experimentNameWiseChaosDataOfWorkflowRuns[
              runIndex
            ].push({
              experimentName: chaosData.experimentName,
              chaosData,
            });
          }
        }
        if (executionData.event_type === 'UPDATE') {
          workflowRunWiseDetailsForSchedule.resilienceScoreForWorkflowRuns[
            runIndex
          ] = executionData.resiliency_score ?? NaN;
        } else if (
          executionData.finishedAt.length === 0 ||
          executionData.phase === STATUS_RUNNING
        ) {
          workflowRunWiseDetailsForSchedule.resilienceScoreForWorkflowRuns[
            runIndex
          ] = NaN;
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
  return workflowRunWiseDetailsForSchedule;
};

const getRunWiseChaosMetrics = (
  idsOfWorkflowRuns: string[],
  experimentNameWiseChaosDataOfWorkflowRuns: ExperimentNameAndChaosDataMap[][],
  experimentNameFromYaml: string,
  resilienceScoreForWorkflowRuns: number[],
  statusOfWorkflowRuns: string[]
) => {
  const workflowRunMetricsPerExperiment: RunWiseChaosMetrics[] = [];
  experimentNameWiseChaosDataOfWorkflowRuns.forEach(
    (dataArray: ExperimentNameAndChaosDataMap[], runIndex) => {
      try {
        let selectedChaosData: ChaosData = {
          engineName: '',
          engineUID: '',
          experimentName: '',
          experimentPod: '',
          experimentStatus: '',
          experimentVerdict: '',
          failStep: '',
          lastUpdatedAt: '',
          namespace: '',
          probeSuccessPercentage: '',
          runnerPod: '',
        };
        dataArray.forEach(
          (experimentNameAndChaosData: ExperimentNameAndChaosDataMap) => {
            if (
              experimentNameAndChaosData.experimentName ===
              experimentNameFromYaml
            ) {
              selectedChaosData = experimentNameAndChaosData.chaosData;
            }
          }
        );
        workflowRunMetricsPerExperiment.push({
          runIndex,
          runID: idsOfWorkflowRuns[runIndex],
          lastUpdatedTimeStamp: parseInt(selectedChaosData.lastUpdatedAt, 10),
          probeSuccessPercentage: `${selectedChaosData.probeSuccessPercentage}%`,
          experimentStatus: selectedChaosData.experimentStatus,
          experimentVerdict: selectedChaosData.experimentVerdict,
          resilienceScore: `${
            resilienceScoreForWorkflowRuns[runIndex] +
            (Number.isNaN(resilienceScoreForWorkflowRuns[runIndex]) ? '' : '%')
          }`,
          workflowStatus: statusOfWorkflowRuns[runIndex],
        });
      } catch (error) {
        console.error(error);
      }
    }
  );
  return workflowRunMetricsPerExperiment;
};

export const getChaosQueryPromInputAndID = (
  analyticsData: WorkflowList,
  agentID: string,
  areaGraph: string[],
  timeRangeDiff: number,
  selectedStartTime: number,
  selectedEndTime: number,
  existingEvents: ChaosEventDetails[]
) => {
  const chaosInformation: ChaosInformation = {
    promQueries: [],
    chaosQueryIDs: [],
    chaosEventList: [],
    numberOfWorkflowsUnderConsideration: 0,
  };
  const chaosResultNamesAndNamespacesMap: ChaosResultNamesAndNamespacesMap[] = [];
  const workflowAndExperimentMetaDataMap: WorkflowAndExperimentMetaDataMap[] = [];
  analyticsData?.ListWorkflow.forEach((schedule: Workflow) => {
    if (schedule.cluster_id === agentID && !schedule.isRemoved) {
      const workflowRunWiseDetails: WorkflowRunWiseDetails = getWorkflowRunWiseDetails(
        schedule
      );
      let workflowYaml: WorkflowYaml | CronWorkflowYaml;
      let parametersMap: Parameter[];
      let workflowYamlCheck: boolean = true;
      try {
        workflowYaml = JSON.parse(schedule.workflow_manifest);
        parametersMap = (workflowYaml as WorkflowYaml).spec.arguments
          .parameters;
      } catch (err) {
        workflowYaml = JSON.parse(schedule.workflow_manifest);
        parametersMap = (workflowYaml as CronWorkflowYaml).spec.workflowSpec
          .arguments.parameters;
        workflowYamlCheck = false;
      }
      (workflowYamlCheck
        ? (workflowYaml as WorkflowYaml).spec.templates
        : (workflowYaml as CronWorkflowYaml).spec.workflowSpec.templates
      ).forEach((template: Template) => {
        if (template.inputs && template.inputs.artifacts) {
          template.inputs.artifacts.forEach((artifact: Artifact) => {
            const parsedEmbeddedYaml = YAML.parse(artifact.raw.data);
            if (parsedEmbeddedYaml.kind === 'ChaosEngine') {
              let engineNamespace: string = '';
              if (typeof parsedEmbeddedYaml.metadata.namespace === 'string') {
                engineNamespace = (parsedEmbeddedYaml.metadata
                  .namespace as string).substring(
                  1,
                  (parsedEmbeddedYaml.metadata.namespace as string).length - 1
                );
              } else {
                engineNamespace = Object.keys(
                  parsedEmbeddedYaml.metadata.namespace
                )[0];
              }
              if (validateWorkflowParameter(engineNamespace)) {
                engineNamespace = getWorkflowParameter(engineNamespace);
                parametersMap.forEach((parameterKeyValue: Parameter) => {
                  if (parameterKeyValue.name === engineNamespace) {
                    engineNamespace = parameterKeyValue.value;
                  }
                });
              } else {
                engineNamespace = parsedEmbeddedYaml.metadata.namespace;
              }
              let matchIndex: number = -1;
              const check: number = chaosResultNamesAndNamespacesMap.filter(
                (data, index) => {
                  if (
                    data.resultName.includes(
                      parsedEmbeddedYaml.metadata.name
                    ) &&
                    data.resultNamespace === engineNamespace
                  ) {
                    matchIndex = index;
                    return true;
                  }
                  return false;
                }
              ).length;
              if (check === 0) {
                chaosResultNamesAndNamespacesMap.push({
                  resultName: `${parsedEmbeddedYaml.metadata.name}-${parsedEmbeddedYaml.spec.experiments[0].name}`,
                  resultNamespace: engineNamespace,
                  workflowName: workflowYaml.metadata.name,
                  experimentName: parsedEmbeddedYaml.spec.experiments[0].name,
                  selectedWorkflowIds: [schedule.workflow_id],
                });
                workflowAndExperimentMetaDataMap.push({
                  workflowID: schedule.workflow_id,
                  workflowName: workflowYaml.metadata.name,
                  experimentName: parsedEmbeddedYaml.spec.experiments[0].name,
                  targetApp: parsedEmbeddedYaml.spec.appinfo?.applabel.split(
                    '='
                  )[1],
                  targetNamespace: parsedEmbeddedYaml.spec.appinfo?.appns,
                  runWiseChaosMetrics: getRunWiseChaosMetrics(
                    workflowRunWiseDetails.idsOfWorkflowRuns,
                    workflowRunWiseDetails.experimentNameWiseChaosDataOfWorkflowRuns,
                    parsedEmbeddedYaml.spec.experiments[0].name,
                    workflowRunWiseDetails.resilienceScoreForWorkflowRuns,
                    workflowRunWiseDetails.statusOfWorkflowRuns
                  ),
                });
              } else {
                chaosResultNamesAndNamespacesMap[
                  matchIndex
                ].workflowName = `${chaosResultNamesAndNamespacesMap[matchIndex].workflowName}, \n${workflowYaml.metadata.name}`;
                chaosResultNamesAndNamespacesMap[
                  matchIndex
                ].selectedWorkflowIds.push(schedule.workflow_id);
                workflowAndExperimentMetaDataMap.push({
                  workflowID: schedule.workflow_id,
                  workflowName: workflowYaml.metadata.name,
                  experimentName:
                    chaosResultNamesAndNamespacesMap[matchIndex].experimentName,
                  targetApp: parsedEmbeddedYaml.spec.appinfo.applabel.split(
                    '='
                  )[1],
                  targetNamespace: parsedEmbeddedYaml.spec.appinfo.appns,
                  runWiseChaosMetrics: getRunWiseChaosMetrics(
                    workflowRunWiseDetails.idsOfWorkflowRuns,
                    workflowRunWiseDetails.experimentNameWiseChaosDataOfWorkflowRuns,
                    chaosResultNamesAndNamespacesMap[matchIndex].experimentName,
                    workflowRunWiseDetails.resilienceScoreForWorkflowRuns,
                    workflowRunWiseDetails.statusOfWorkflowRuns
                  ),
                });
              }
            }
          });
        }
      });
    }
  });

  chaosResultNamesAndNamespacesMap.forEach((keyValue, index) => {
    let queryID: string = uuidv4();

    const matchingEvent: ChaosEventDetails[] = existingEvents.filter(
      (event: ChaosEventDetails) =>
        event.workflow === keyValue.workflowName &&
        event.experiment === keyValue.experimentName
    );

    if (matchingEvent.length) {
      queryID = matchingEvent[0].id;
    }

    const chaosEventMetrics: WorkflowAndExperimentMetaDataMap = workflowAndExperimentMetaDataMap.filter(
      (data) =>
        keyValue.selectedWorkflowIds.includes(data.workflowID) &&
        data.experimentName === keyValue.experimentName
    )[0];

    const availableRunMetrics: RunWiseChaosMetrics[] = chaosEventMetrics.runWiseChaosMetrics.filter(
      (eventMetric) =>
        eventMetric.lastUpdatedTimeStamp >= selectedStartTime &&
        eventMetric.lastUpdatedTimeStamp <= selectedEndTime
    );

    const latestResult: string = availableRunMetrics.length
      ? availableRunMetrics[availableRunMetrics.length - 1].experimentVerdict
      : '--';

    chaosInformation.promQueries.push({
      queryid: queryID,
      query: generateChaosQuery(
        DashboardListData[0].chaosEventQueryTemplate,
        keyValue.resultName,
        keyValue.resultNamespace
      ),
      legend: `${keyValue.workflowName} / \n${keyValue.experimentName}`,
      resolution: DEFAULT_CHAOS_EVENT_PROMETHEUS_QUERY_RESOLUTION,
      minstep:
        timeRangeDiff * chaosResultNamesAndNamespacesMap.length <
        PROMETHEUS_QUERY_RESOLUTION_LIMIT - 1
          ? 1
          : Math.floor(
              (timeRangeDiff * chaosResultNamesAndNamespacesMap.length) /
                (PROMETHEUS_QUERY_RESOLUTION_LIMIT + 1)
            ),
    });
    chaosInformation.chaosQueryIDs.push(queryID);
    chaosInformation.chaosEventList.push({
      id: queryID,
      legend: areaGraph[index % areaGraph.length],
      workflow: keyValue.workflowName,
      experiment: keyValue.experimentName,
      target: `${chaosEventMetrics.targetNamespace} / ${chaosEventMetrics.targetApp}`,
      result: latestResult,
      chaosMetrics: chaosEventMetrics,
      showOnTable: availableRunMetrics.length > 0,
    });
  });

  chaosInformation.numberOfWorkflowsUnderConsideration =
    analyticsData?.ListWorkflow.length;

  return chaosInformation;
};

export const chaosEventDataParserForPrometheus = (
  numOfWorkflows: number,
  workflowAnalyticsData: WorkflowList,
  eventData: PrometheusResponse,
  chaosEventList: ChaosEventDetails[],
  selectedStartTime: number,
  selectedEndTime: number
) => {
  const chaosDataUpdates: ChaosDataUpdates = {
    queryIDs: [],
    chaosData: [],
    reGenerate: false,
    latestEventResult: [],
  };

  if (workflowAnalyticsData.ListWorkflow) {
    if (numOfWorkflows !== workflowAnalyticsData.ListWorkflow.length) {
      chaosDataUpdates.reGenerate = true;
    }
  }

  const workflowCheckList: string[] = [];
  eventData?.GetPromQuery.forEach((queryResponse) => {
    if (
      queryResponse.legends &&
      queryResponse.legends[0] &&
      parseInt(queryResponse.tsvs[0][0].timestamp ?? '0', 10) >=
        selectedStartTime &&
      parseInt(queryResponse.tsvs[0][0].timestamp ?? '0', 10) <= selectedEndTime
    ) {
      const chaosEventDetails: ChaosEventDetails = chaosEventList.filter(
        (e) => queryResponse.queryid === e.id
      )[0];
      let latestRunMetric: RunWiseChaosMetrics | undefined;
      let allRunMetric: RunWiseChaosMetrics[];

      if (chaosEventDetails && workflowAnalyticsData.ListWorkflow) {
        const workflowAndExperiments: WorkflowAndExperimentMetaDataMap =
          chaosEventDetails.chaosMetrics;

        const updatedWorkflowDetails: Workflow = workflowAnalyticsData.ListWorkflow.filter(
          (workflow: Workflow) =>
            workflow.workflow_id === workflowAndExperiments.workflowID
        )[0];

        const updatedWorkflowRunWiseDetailsFromAnalytics: WorkflowRunWiseDetails = getWorkflowRunWiseDetails(
          updatedWorkflowDetails
        );

        if (!workflowCheckList.includes(workflowAndExperiments.workflowID)) {
          workflowCheckList.push(workflowAndExperiments.workflowID);
          updatedWorkflowRunWiseDetailsFromAnalytics.experimentNameWiseChaosDataOfWorkflowRuns.forEach(
            (mapList: ExperimentNameAndChaosDataMap[], index) => {
              const workflowRunID: string =
                updatedWorkflowRunWiseDetailsFromAnalytics.idsOfWorkflowRuns[
                  index
                ];

              const filteredChaosEventDetails: ChaosEventDetails[] = chaosEventList.filter(
                (e) =>
                  workflowAndExperiments.workflowID ===
                  e.chaosMetrics.workflowID
              );

              filteredChaosEventDetails.forEach((event: ChaosEventDetails) => {
                const experimentInWorkflowRunEvent: RunWiseChaosMetrics[] = event.chaosMetrics.runWiseChaosMetrics.filter(
                  (runWiseMetric) => runWiseMetric.runID === workflowRunID
                );

                if (
                  experimentInWorkflowRunEvent.length === 0 &&
                  !event.showOnTable
                ) {
                  chaosDataUpdates.reGenerate = true;
                }
              });
            }
          );
        }

        const updatedRunWiseMetricsPerExperiment: RunWiseChaosMetrics[] = getRunWiseChaosMetrics(
          updatedWorkflowRunWiseDetailsFromAnalytics.idsOfWorkflowRuns,
          updatedWorkflowRunWiseDetailsFromAnalytics.experimentNameWiseChaosDataOfWorkflowRuns,
          workflowAndExperiments.experimentName,
          updatedWorkflowRunWiseDetailsFromAnalytics.resilienceScoreForWorkflowRuns,
          updatedWorkflowRunWiseDetailsFromAnalytics.statusOfWorkflowRuns
        );

        if (
          updatedWorkflowRunWiseDetailsFromAnalytics.idsOfWorkflowRuns
            .length !== workflowAndExperiments.runWiseChaosMetrics.length &&
          updatedRunWiseMetricsPerExperiment.length !== 0
        ) {
          chaosDataUpdates.reGenerate = true;
        }

        const updatedMetrics: RunWiseChaosMetrics[] = [];

        workflowAndExperiments.runWiseChaosMetrics.forEach(
          (metric: RunWiseChaosMetrics) => {
            const changeIndex: number = updatedWorkflowRunWiseDetailsFromAnalytics.idsOfWorkflowRuns.indexOf(
              metric.runID
            );

            updatedMetrics.push({
              runIndex: metric.runIndex,
              runID: metric.runID,
              lastUpdatedTimeStamp:
                updatedRunWiseMetricsPerExperiment[changeIndex]
                  .lastUpdatedTimeStamp,
              probeSuccessPercentage:
                updatedRunWiseMetricsPerExperiment[changeIndex]
                  .probeSuccessPercentage,
              experimentStatus:
                updatedRunWiseMetricsPerExperiment[changeIndex]
                  .experimentStatus,
              experimentVerdict:
                updatedRunWiseMetricsPerExperiment[changeIndex]
                  .experimentVerdict,
              resilienceScore:
                updatedRunWiseMetricsPerExperiment[changeIndex].resilienceScore,
              workflowStatus:
                updatedRunWiseMetricsPerExperiment[changeIndex].workflowStatus,
            });
          }
        );

        const availableRunMetrics: RunWiseChaosMetrics[] = updatedMetrics.filter(
          (eventMetric) =>
            eventMetric.lastUpdatedTimeStamp >= selectedStartTime &&
            eventMetric.lastUpdatedTimeStamp <= selectedEndTime
        );
        allRunMetric = availableRunMetrics;
        latestRunMetric = availableRunMetrics[availableRunMetrics.length - 1];
      }

      chaosDataUpdates.queryIDs.push(queryResponse.queryid);

      chaosDataUpdates.chaosData.push(
        ...queryResponse.legends.map((elem, index) => ({
          metricName: elem[0] ?? DEFAULT_CHAOS_EVENT_NAME,
          data: queryResponse.tsvs[index].map((dataPoint) => ({
            date: parseInt(dataPoint.timestamp ?? '0', 10) * 1000,
            value: parseInt(dataPoint.value ?? '0', 10),
          })),
          baseColor: chaosEventDetails ? chaosEventDetails.legend : '',
          subData: allRunMetric
            .map((elem: RunWiseChaosMetrics) => {
              return [
                {
                  subDataName: 'analytics.subData.workflowStatus',
                  value: elem ? elem.workflowStatus : STATUS_RUNNING,
                  date: elem ? elem.lastUpdatedTimeStamp * 1000 : 0,
                },
                {
                  subDataName: 'analytics.subData.experimentStatus',
                  value: elem ? elem.experimentStatus : STATUS_RUNNING,
                  date: elem ? elem.lastUpdatedTimeStamp * 1000 : 0,
                },
                {
                  subDataName: 'analytics.subData.resilienceScore',
                  value:
                    elem &&
                    elem.workflowStatus !== STATUS_RUNNING &&
                    elem.resilienceScore !== INVALID_RESILIENCE_SCORE_STRING
                      ? elem.resilienceScore
                      : '--',
                  date: elem ? elem.lastUpdatedTimeStamp * 1000 : 0,
                },
                {
                  subDataName: 'analytics.subData.probeSuccessPercentage',
                  value: elem ? elem.probeSuccessPercentage : '--',
                  date: elem ? elem.lastUpdatedTimeStamp * 1000 : 0,
                },
                {
                  subDataName: 'analytics.subData.experimentVerdict',
                  value: elem ? elem.experimentVerdict : '--',
                  date: elem ? elem.lastUpdatedTimeStamp * 1000 : 0,
                },
              ];
            })
            .flat(),
        }))
      );
      chaosDataUpdates.latestEventResult.push(
        latestRunMetric ? latestRunMetric.experimentVerdict : '--'
      );
    }
  });

  if (workflowAnalyticsData.ListWorkflow) {
    if (eventData?.GetPromQuery.length < chaosDataUpdates.chaosData.length) {
      chaosDataUpdates.reGenerate = true;
    }
    if (
      numOfWorkflows !== workflowAnalyticsData.ListWorkflow.length &&
      workflowAnalyticsData.ListWorkflow.length !== 0
    ) {
      chaosDataUpdates.reGenerate = true;
    }
  }

  return chaosDataUpdates;
};

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
  return promQueries;
};

export const seriesDataParserForPrometheus = (
  prometheusData: PrometheusResponse,
  lineGraph: string[]
) => {
  const seriesData: Array<GraphMetric> = [];
  prometheusData.GetPromQuery.forEach((queryResponse, mainIndex) => {
    if (queryResponse.legends && queryResponse.legends[0]) {
      seriesData.push(
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
  });
  return seriesData;
};
