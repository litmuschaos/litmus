import { gql } from '@apollo/client';

export const GET_CLUSTER = gql`
  query getClusters($projectID: String!, $clusterType: String) {
    getCluster(projectID: $projectID, clusterType: $clusterType) {
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
  query getClusters($projectID: String!) {
    getCluster(projectID: $projectID) {
      clusterID
    }
  }
`;

export const GET_CLUSTER_NAMES = gql`
  query getClusters($projectID: String!) {
    getCluster(projectID: $projectID) {
      clusterName
    }
  }
`;
