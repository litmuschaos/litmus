import { gql } from '@apollo/client';

export const WORKFLOW_EVENTS_WITH_EXEC_DATA = gql`
  subscription workflowEvents($projectID: String!) {
    workflowEventListener(project_id: $projectID) {
      workflow_id
      workflow_name
      workflow_run_id
      cluster_name
      last_updated
      cluster_id
      phase
      execution_data
      resiliency_score
    }
  }
`;

export const WORKFLOW_EVENTS = gql`
  subscription workflowEvents($projectID: String!) {
    workflowEventListener(project_id: $projectID) {
      workflow_id
      workflow_name
      workflow_run_id
      cluster_name
      last_updated
      phase
      resiliency_score
      experiments_passed
      total_experiments
    }
  }
`;

export const WORKFLOW_LOGS = gql`
  subscription podLog($podDetails: PodLogRequest!) {
    getPodLog(podDetails: $podDetails) {
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
