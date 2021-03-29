/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-loop-func */
/* eslint-disable no-console */
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
  WeightageMap,
  Workflow,
  WorkflowList,
  WorkflowRun,
} from '../models/graphql/workflowListData';
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
  schedule.workflow_runs.forEach((data: WorkflowRun, runIndex) => {
    try {
      const executionData: ExecutionData = JSON.parse(data.execution_data);
      workflowRunWiseDetailsForSchedule.idsOfWorkflowRuns[runIndex] =
        data.workflow_run_id;
      workflowRunWiseDetailsForSchedule.statusOfWorkflowRuns[runIndex] =
        executionData.finishedAt.length === 0 ? 'Running' : executionData.phase;
      const { nodes } = executionData;
      const workflowsRunResults: number[] = [];
      let weightsSum: number = 0;
      let isValid: boolean = false;
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
          if (
            chaosData.experimentVerdict === 'Pass' ||
            chaosData.experimentVerdict === 'Fail'
          ) {
            const weightageMap: WeightageMap[] = schedule.weightages;
            weightageMap.forEach((weightage) => {
              if (weightage.experiment_name === chaosData.experimentName) {
                if (chaosData.experimentVerdict === 'Pass') {
                  workflowsRunResults.push(
                    (weightage.weightage *
                      parseInt(chaosData.probeSuccessPercentage, 10)) /
                      100
                  );
                }
                if (chaosData.experimentVerdict === 'Fail') {
                  workflowsRunResults.push(0);
                }
                if (
                  chaosData.experimentVerdict === 'Pass' ||
                  chaosData.experimentVerdict === 'Fail'
                ) {
                  weightsSum += weightage.weightage;
                  isValid = true;
                }
              }
            });
          }
        }
      }
      if (executionData.event_type === 'UPDATE' && isValid) {
        workflowRunWiseDetailsForSchedule.resilienceScoreForWorkflowRuns[
          runIndex
        ] = workflowsRunResults.length
          ? (workflowsRunResults.reduce((a, b) => a + b, 0) / weightsSum) * 100
          : 0;
      }
    } catch (error) {
      console.error(error);
    }
  });
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
        let runWiseChaosMetrics: RunWiseChaosMetrics = {
          runIndex: 0,
          runID: '',
          lastUpdatedTimeStamp: 0,
          probeSuccessPercentage: '',
          experimentStatus: '',
          experimentVerdict: '',
          resilienceScore: '',
          workflowStatus: '',
        };
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
        runWiseChaosMetrics = {
          runIndex,
          runID: idsOfWorkflowRuns[runIndex],
          lastUpdatedTimeStamp: parseInt(selectedChaosData.lastUpdatedAt, 10),
          probeSuccessPercentage: `${selectedChaosData.probeSuccessPercentage}%`,
          experimentStatus: selectedChaosData.experimentStatus,
          experimentVerdict: selectedChaosData.experimentVerdict,
          resilienceScore: `${resilienceScoreForWorkflowRuns[runIndex]}%`,
          workflowStatus: statusOfWorkflowRuns[runIndex],
        };
        workflowRunMetricsPerExperiment.push(runWiseChaosMetrics);
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
  selectedEndTime: number
) => {
  const chaosInformation: ChaosInformation = {
    promQueries: [],
    chaosQueryIDs: [],
    chaosEventList: [],
    numberOfWorfklowsUnderConsideration: 0,
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
                  targetApp: parsedEmbeddedYaml.spec.appinfo.applabel.split(
                    '='
                  )[1],
                  targetNamespace: parsedEmbeddedYaml.spec.appinfo.appns,
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
    const queryID: string = uuidv4();

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
      : '-';

    if (
      availableRunMetrics.length ||
      chaosEventMetrics.runWiseChaosMetrics.length === 0
    ) {
      chaosInformation.promQueries.push({
        queryid: queryID,
        query: generateChaosQuery(
          DashboardListData[0].chaosEventQueryTemplate,
          keyValue.resultName,
          keyValue.resultNamespace
        ),
        legend: `${keyValue.workflowName} / \n${keyValue.experimentName}`,
        resolution: '1/2',
        minstep:
          timeRangeDiff * chaosResultNamesAndNamespacesMap.length < 10999
            ? 1
            : Math.floor(
                (timeRangeDiff * chaosResultNamesAndNamespacesMap.length) /
                  11001
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
      });
    }
  });

  chaosInformation.numberOfWorfklowsUnderConsideration =
    analyticsData?.ListWorkflow.length;
  return chaosInformation;
};

export const chaosEventDataParserForPrometheus = (
  numOfWorfklows: number,
  workflowAnalyticsData: WorkflowList,
  eventData: PrometheusResponse,
  chaosInput: string[],
  chaosEventList: ChaosEventDetails[],
  selectedStartTime: number,
  selectedEndTime: number
) => {
  const chaosDataUpdates: ChaosDataUpdates = {
    chaosData: [],
    reGenerate: false,
  };

  eventData?.GetPromQuery.forEach((queryResponse) => {
    // if (chaosInput.includes(queryResponse.queryid)) {
    if (queryResponse.legends && queryResponse.legends[0]) {
      const chaosEventDetails: ChaosEventDetails = chaosEventList.filter(
        (e) => queryResponse.queryid === e.id
      )[0];
      let latestRunMetric: RunWiseChaosMetrics;
      if (chaosEventDetails) {
        const workflowAndExperiments: WorkflowAndExperimentMetaDataMap =
          chaosEventDetails.chaosMetrics;

        const updatedWorkflowDetails: Workflow = workflowAnalyticsData.ListWorkflow.filter(
          (workflow: Workflow) =>
            workflow.workflow_id === workflowAndExperiments.workflowID
        )[0];

        const updatedWorkflowRunWiseDetailsFromAnalytics: WorkflowRunWiseDetails = getWorkflowRunWiseDetails(
          updatedWorkflowDetails
        );

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
        latestRunMetric = availableRunMetrics[availableRunMetrics.length - 1];
      }
      chaosDataUpdates.chaosData.push(
        ...queryResponse.legends.map((elem, index) => ({
          metricName: elem[0] ?? 'chaos',
          data: queryResponse.tsvs[index].map((dataPoint) => ({
            date: parseInt(dataPoint.timestamp ?? '0', 10) * 1000,
            value: parseInt(dataPoint.value ?? '0', 10),
          })),
          baseColor: chaosEventDetails ? chaosEventDetails.legend : '',
          subData: [
            {
              subDataName: 'Workflow Status',
              value: latestRunMetric
                ? latestRunMetric.workflowStatus
                : 'Running',
            },
            {
              subDataName: 'Experiment Status',
              value: latestRunMetric
                ? latestRunMetric.experimentStatus
                : 'Running',
            },
            {
              subDataName: 'Resilience Score',
              value: latestRunMetric ? latestRunMetric.resilienceScore : '-',
            },
            {
              subDataName: 'Probe Success Percentage',
              value: latestRunMetric
                ? latestRunMetric.probeSuccessPercentage
                : '-',
            },
            {
              subDataName: 'Experiment Verdict',
              value: latestRunMetric ? latestRunMetric.experimentVerdict : '-',
            },
          ],
          // Filter subData within the start and end time of interleaving on experiment's lastUpdatedTimeStamp.
          // Add one extra subData field - lastUpdatedTimeStamp to filter subData in graph.
          // This method sends the latest run details within selected dashboard time range as the subData.
          // Needs to be updated to send every run detail with lastUpdatedTimeStamp in the ${NEW_SUBDATA_FIELD}.
          /* 
            Schema: 
            (to be updated as)
            - subData: [
                { subDataName: "subData-1-1", value: "1-1", lastUpdatedTimeStamp: 1616832979 },
                { subDataName: "subData-1-2", value: "1-2", lastUpdatedTimeStamp: 1616833006 },
              ],
            subData: 
            (to be filtered by lastUpdatedTimeStamp in litmus-ui graph on hovering over chaos events)
            - Workflow Status 
            - Experiment Status
            - Resilience Score
            - Probe Success Percentage
            - Experiment Verdict
            */
        }))
      );
    }
    // }
  });
  if (eventData?.GetPromQuery.length > chaosDataUpdates.chaosData.length) {
    chaosDataUpdates.reGenerate = true;
  }
  if (
    numOfWorfklows !== workflowAnalyticsData.ListWorkflow.length &&
    workflowAnalyticsData.ListWorkflow.length !== 0
  ) {
    chaosDataUpdates.reGenerate = true;
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
        10999
          ? parseInt(query.minstep, 10)
          : Math.floor((timeRangeDiff * prom_queries.length) / 11001),
    });
  });
  return promQueries;
};

export const seriesDataParserForPrometheus = (
  prometheusData: PrometheusResponse,
  lineGraph: string[]
) => {
  const seriesData: Array<GraphMetric> = [];
  prometheusData.GetPromQuery.forEach((queryResponse) => {
    if (queryResponse.legends && queryResponse.legends[0]) {
      seriesData.push(
        ...queryResponse.legends.map((elem, index) => ({
          metricName: elem[0] ?? 'metric',
          data: queryResponse.tsvs[index].map((dataPoint) => ({
            date: parseInt(dataPoint.timestamp ?? '0', 10) * 1000,
            value: parseFloat(dataPoint.value ?? '0.0'),
          })),
          baseColor: lineGraph[index % lineGraph.length],
        }))
      );
    }
  });
  return seriesData;
};
