import { gql } from '@apollo/client';

export const WORKFLOW_DETAILS = gql`
  query workflowDetails($projectID: String!) {
    getWorkFlowRuns(project_id: $projectID) {
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
  subscription workflowEvents($projectID: String!) {
    workflowEventListener(project_id: $projectID) {
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

export const CREATE_WORKFLOW = gql`
  mutation createChaosWorkFlow($ChaosWorkFlowInput: ChaosWorkFlowInput!) {
    createChaosWorkFlow(input: $ChaosWorkFlowInput) {
      workflow_id
      cronSyntax
      workflow_name
      workflow_description
      isCustomWorkflow
    }
  }
`;
export const CREATE_USER = gql`
  mutation CreateUser($user: UserInput!) {
    createUser(user: $user) {
      id
      username
      created_at
      updated_at
      removed_at
    }
  }
`;

export const GET_USER = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      username
      email
      name
      project_id
    }
  }
`;

export const GET_PROJECT = gql`
  query getProject($projectID: String!) {
    getProject(projectID: $projectID) {
      name
      id
    }
  }
`;

export const GET_CLUSTER = gql`
  query getCluster($project_id: String!, $cluster_type: String) {
    getCluster(project_id: $project_id, cluster_type: $cluster_type) {
      cluster_id
    }
  }
`;
