import { gql } from '@apollo/client';

// GetWorkflowRuns
export const WORKFLOW_DETAILS_WITH_EXEC_DATA = gql`
  query getWorkflowRuns($request: GetWorkflowRunsRequest!) {
    getWorkflowRuns(request: $request) {
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
  query getWorkflowRuns($request: GetWorkflowRunsRequest!) {
    getWorkflowRuns(request: $request) {
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
        executedBy
      }
    }
  }
`;

export const WORKFLOW_RUN_DETAILS = gql`
  query getWorkflowRuns($request: GetWorkflowRunsRequest!) {
    getWorkflowRuns(request: $request) {
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
export const GET_WORKFLOW_DETAILS = gql`
  query getWorkflows($request: GetWorkflowsRequest!) {
    getWorkflows(request: $request) {
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
        projectID
        clusterID
        clusterType
        isRemoved
        lastUpdatedBy
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
  query getPredefinedWorkflows($hubName: String!, $projectID: String!) {
    getPredefinedWorkflows(hubName: $hubName, projectID: $projectID)
  }
`;
