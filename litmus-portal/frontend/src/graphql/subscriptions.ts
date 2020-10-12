import { gql } from '@apollo/client';

export const WORKFLOW_EVENTS = gql`
  subscription workflowEvents($projectID: String!) {
    workflowEventListener(project_id: $projectID) {
      workflow_id
      workflow_name
      workflow_run_id
      execution_data
      project_id
      cluster_name
      last_updated
      cluster_id
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
