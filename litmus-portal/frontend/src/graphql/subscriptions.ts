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
      execution_data
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
