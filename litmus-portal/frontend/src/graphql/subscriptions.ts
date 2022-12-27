import { gql } from '@apollo/client';

export const WORKFLOW_EVENTS_WITH_EXEC_DATA = gql`
  subscription getWorkflowEvents($projectID: String!) {
    getWorkflowEvents(projectID: $projectID) {
      workflowID
      workflowName
      workflowRunID
      clusterName
      lastUpdated
      clusterID
      phase
      executionData
      resiliencyScore
    }
  }
`;

export const WORKFLOW_EVENTS = gql`
  subscription getWorkflowEvents($projectID: String!) {
    getWorkflowEvents(projectID: $projectID) {
      workflowID
      workflowName
      workflowRunID
      clusterName
      lastUpdated
      phase
      resiliencyScore
      experimentsPassed
      totalExperiments
    }
  }
`;

export const WORKFLOW_LOGS = gql`
  subscription podLog($request: PodLogRequest!) {
    getPodLog(request: $request) {
      log
    }
  }
`;

export const KUBE_OBJ = gql`
  subscription getKubeObject($request: KubeObjectRequest!) {
    getKubeObject(request: $request) {
      clusterID
      kubeObj
    }
  }
`;

export const VIEW_DASHBOARD = gql`
  subscription viewDashboard(
    $dashboardID: String
    $promQueries: [PromQueryInput!]!
    $dashboardQueryMap: [QueryMapForPanelGroup!]!
    $dataVariables: DataVars!
  ) {
    viewDashboard(
      dashboardID: $dashboardID
      promQueries: $promQueries
      dashboardQueryMap: $dashboardQueryMap
      dataVariables: $dataVariables
    ) {
      dashboardMetricsResponse {
        panelGroupID
        panelGroupMetricsResponse {
          panelID
          panelMetricsResponse {
            queryID
            legends
            tsvs {
              date
              value
            }
          }
        }
      }
      annotationsResponse {
        queryID
        legends
        tsvs {
          date
          value
        }
        subDataArray {
          date
          subDataName
          value
        }
      }
    }
  }
`;
