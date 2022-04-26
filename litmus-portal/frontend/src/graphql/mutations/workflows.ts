import { gql } from '@apollo/client';

// Workflow
export const CREATE_WORKFLOW = gql`
  mutation createChaosWorkFlow($ChaosWorkFlowInput: ChaosWorkFlowInput!) {
    createChaosWorkFlow(input: $ChaosWorkFlowInput) {
      workflowID
      cronSyntax
      workflowName
      workflowDescription
      isCustomWorkflow
    }
  }
`;

export const UPDATE_SCHEDULE = gql`
  mutation updateChaosWorkflow($ChaosWorkFlowInput: ChaosWorkFlowInput!) {
    updateChaosWorkflow(input: $ChaosWorkFlowInput) {
      workflowID
      cronSyntax
      workflowName
      workflowDescription
      isCustomWorkflow
    }
  }
`;

export const RERUN_CHAOS_WORKFLOW = gql`
  mutation reRunChaosWorkflow($projectID: String!, $workflowID: String!) {
    reRunChaosWorkFlow(projectID: $projectID, workflowID: $workflowID)
  }
`;

export const SYNC_WORKFLOW = gql`
  mutation syncWorkflow(
    $projectID: String!
    $workflowID: String!
    $workflowRunID: String!
  ) {
    syncWorkflow(
      projectID: $projectID
      workflowID: $workflowID
      workflowRunID: $workflowRunID
    )
  }
`;

export const DELETE_WORKFLOW = gql`
  mutation deleteWorkflow(
    $projectID: String!
    $workflowID: String
    $workflowRunID: String
  ) {
    deleteChaosWorkflow(
      projectID: $projectID
      workflowID: $workflowID
      workflowRunID: $workflowRunID
    )
  }
`;

export const TERMINATE_WORKFLOW = gql`
  mutation terminateWorkflow(
    $projectID: String!
    $workflowID: String
    $workflowRunID: String
  ) {
    terminateChaosWorkflow(
      projectID: $projectID
      workflowID: $workflowID
      workflowRunID: $workflowRunID
    )
  }
`;
