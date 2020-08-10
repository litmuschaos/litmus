import { gql } from '@apollo/client';

export const WORKFLOW_DETAILS = gql`
  query {
    getWorkFlowRuns(project_id: "00000") {
      workflow_id
      workflow_name
      workflow_run_id
      execution_data
      project_id
      cluster_name
      last_updated
    }
  }
`;

export const WORKFLOW_EVENTS = gql`
  subscription {
    workflowEventListener(project_id: "00000") {
      workflow_id
      workflow_name
      workflow_run_id
      execution_data
      project_id
      cluster_name
      last_updated
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($user: UserInput!) {
    createUser(user: $user) {
      id
      user_name
      created_at
      update_at
      removed_at
    }
  }
`;
