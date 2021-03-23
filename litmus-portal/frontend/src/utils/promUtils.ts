/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
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
  ChaosInformation,
  ChaosResultNamesAndNamespacesMap,
} from '../models/dashboardsData';
import { PrometheusResponse } from '../models/graphql/prometheus';
import { Workflow, WorkflowList } from '../models/graphql/workflowListData';
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
    isRemoved: [],
  };
  return parsedChaosInfoMap;
};

export const getChaosQueryPromInputAndID = (
  analyticsData: WorkflowList,
  agentID: string
) => {
  const chaosInformation: ChaosInformation = {
    promQueries: [],
    chaosQueryIDs: [],
  };
  const chaosResultNamesAndNamespacesMap: ChaosResultNamesAndNamespacesMap[] = [];
  analyticsData?.ListWorkflow.forEach((schedule: Workflow) => {
    if (schedule.cluster_id === agentID && !schedule.isRemoved) {
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
                  isRemoved: [],
                });
              } else {
                chaosResultNamesAndNamespacesMap[
                  matchIndex
                ].workflowName = `${chaosResultNamesAndNamespacesMap[matchIndex].workflowName}, \n${workflowYaml.metadata.name}`;
              }
            }
          });
        }
      });
    }
  });

  chaosResultNamesAndNamespacesMap.forEach((keyValue) => {
    const queryID: string = uuidv4();
    chaosInformation.promQueries.push({
      queryid: queryID,
      query: generateChaosQuery(
        DashboardListData[0].chaosEventQueryTemplate,
        keyValue.resultName,
        keyValue.resultNamespace
      ),
      legend: `${keyValue.workflowName} / \n${keyValue.experimentName}`,
      resolution: '1/2',
      minstep: 1,
    });
    chaosInformation.chaosQueryIDs.push(queryID);
  });

  return chaosInformation;
};

export const chaosEventDataParserForPrometheus = (
  eventData: PrometheusResponse,
  chaosInput: string[],
  color: string
) => {
  const chaos_data: Array<GraphMetric> = [];
  eventData?.GetPromQuery.forEach((queryResponse) => {
    if (chaosInput.includes(queryResponse.queryid)) {
      if (queryResponse.legends && queryResponse.legends[0]) {
        chaos_data.push(
          ...queryResponse.legends.map((elem, index) => ({
            metricName: elem[0] ?? 'chaos',
            data: queryResponse.tsvs[index].map((dataPoint) => ({
              date: parseInt(dataPoint.timestamp ?? '0', 10) * 1000,
              value: parseInt(dataPoint.value ?? '0', 10),
            })),
            baseColor: color,
          }))
        );
      }
    }
  });
  return chaos_data;
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
