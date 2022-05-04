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
  subscription getKubeObject($data: KubeObjectRequest!) {
    getKubeObject(kubeObjectRequest: $data) {
      cluster_id
      kube_obj
    }
  }
`;

export const VIEW_DASHBOARD = gql`
  subscription viewDashboard(
    $dbID: String
    $prometheusQueries: [promQueryInput!]!
    $queryMap: [queryMapForPanelGroup!]!
    $dataVarMap: dataVars!
  ) {
    viewDashboard(
      dashboardID: $dbID
      promQueries: $prometheusQueries
      dashboardQueryMap: $queryMap
      dataVariables: $dataVarMap
    ) {
      dashboardMetricsResponse {
        panelGroupID
        panelGroupMetricsResponse {
          panelID
          PanelMetricsResponse {
            queryid
            legends
            tsvs {
              date
              value
            }
          }
        }
      }
      annotationsResponse {
        queryid
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
