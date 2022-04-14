import { gql } from '@apollo/client';

// GetWorkflowRuns
export const WORKFLOW_DETAILS_WITH_EXEC_DATA = gql`
  query workflowDetails($workflowRunsInput: GetWorkflowRunsInput!) {
    getWorkflowRuns(workflowRunsInput: $workflowRunsInput) {
      totalNoOfWorkflowRuns
      workflowRuns {
        workflowID
        workflowName
        workflowRunID
        clusterName
        lastUpdated
        clusterID
        phase
        executionData
        resiliencyScore
        isRemoved
      }
    }
  }
`;

export const WORKFLOW_DETAILS = gql`
  query workflowDetails($workflowRunsInput: GetWorkflowRunsInput!) {
    getWorkflowRuns(workflowRunsInput: $workflowRunsInput) {
      totalNoOfWorkflowRuns
      workflowRuns {
        workflowRunID
        workflowID
        clusterName
        lastUpdated
        projectID
        clusterID
        workflowName
        clusterType
        phase
        resiliencyScore
        experimentsPassed
        experimentsFailed
        experimentsAwaited
        experimentsStopped
        experimentsNa
        totalExperiments
        isRemoved
      }
    }
  }
`;

export const WORKFLOW_RUN_DETAILS = gql`
  query workflowDetails($workflowRunsInput: GetWorkflowRunsInput!) {
    getWorkflowRuns(workflowRunsInput: $workflowRunsInput) {
      totalNoOfWorkflowRuns
      workflowRuns {
        weightages {
          experimentName
          weightage
        }
        workflowID
        workflowName
        workflowRunID
        clusterName
        executionData
        lastUpdated
        phase
        resiliencyScore
        experimentsPassed
        totalExperiments
        isRemoved
      }
    }
  }
`;

// getWorkflowStats
export const WORKFLOW_STATS = gql`
  query getWorkflowStats(
    $projectID: ID!
    $filter: TimeFrequency!
    $showWorkflowRuns: Boolean!
  ) {
    getWorkflowStats(
      projectID: $projectID
      filter: $filter
      showWorkflowRuns: $showWorkflowRuns
    ) {
      date
      value
    }
  }
`;

// ListWorkflow
export const WORKFLOW_LIST_DETAILS = gql`
  query workflowListDetails($workflowInput: ListWorkflowsInput!) {
    ListWorkflow(workflowInput: $workflowInput) {
      totalNoOfWorkflows
      workflows {
        workflowID
        workflowManifest
        cronSyntax
        clusterName
        workflowName
        workflowDescription
        weightages {
          experimentName
          weightage
        }
        isCustomWorkflow
        updatedAt
        createdAt
        projectId
        clusterId
        clusterType
        isRemoved
      }
    }
  }
`;

// getWorkflowRunStats
export const GET_WORKFLOW_RUNS_STATS = gql`
  query getWorkflowRunStats(
    $workflowRunStatsRequest: WorkflowRunStatsRequest!
  ) {
    getWorkflowRunStats(workflowRunStatsRequest: $workflowRunStatsRequest) {
      totalWorkflowRuns
      succeededWorkflowRuns
      failedWorkflowRuns
      runningWorkflowRuns
      workflowRunSucceededPercentage
      workflowRunFailedPercentage
      averageResiliencyScore
      passedPercentage
      failedPercentage
      totalExperiments
      experimentsPassed
      experimentsFailed
      experimentsAwaited
      experimentsStopped
      experimentsNa
    }
  }
`;

// getPredefinedWorkflowList
export const GET_PREDEFINED_WORKFLOW_LIST = gql`
  query GetPredefinedWorkflowList($hubname: String!, $projectid: String!) {
    getPredefinedWorkflowList(hubName: $hubname, projectID: $projectid)
  }
`;
