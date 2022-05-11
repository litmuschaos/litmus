import { gql } from '@apollo/client';

export const GET_CLUSTER = gql`
  query listClusters($projectID: String!, $clusterType: String) {
    listClusters(projectID: $projectID, clusterType: $clusterType) {
      clusterID
      clusterName
      description
      isActive
      isRegistered
      isClusterConfirmed
      updatedAt
      createdAt
      clusterType
      noOfSchedules
      noOfWorkflows
      token
      lastWorkflowTimestamp
      agentNamespace
      agentScope
      version
    }
  }
`;

export const GET_CLUSTER_LENGTH = gql`
  query listClusters($projectID: String!) {
    listClusters(projectID: $projectID) {
      clusterID
    }
  }
`;

export const GET_CLUSTER_NAMES = gql`
  query listClusters($projectID: String!) {
    listClusters(projectID: $projectID) {
      clusterName
    }
  }
`;
