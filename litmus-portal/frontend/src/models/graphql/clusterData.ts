export interface Cluster {
  clusterID: string;
  projectID: string;
  clusterName: string;
  description: string;
  platformName: string;
  accessKey: string;
  isRegistered: boolean;
  isClusterConfirmed: boolean;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
  clusterType: string;
  noOfWorkflows: number;
  noOfSchedules: number;
  token: string;
  agentNamespace: string;
  serviceAccount: string;
  agentScope: string;
  agentNSExists: boolean;
  agentSAExists: boolean;
  lastWorkflowTimestamp: string;
  version: string;
}

export interface Clusters {
  getCluster: Cluster[];
}

export interface CreateClusterRequest {
  request: {
    clusterName: string;
    description: string;
    platformName: string;
    projectID: string;
    clusterType: string;
    agentNamespace: string;
    serviceAccount: string;
    agentScope: string;
    agentNSExists: boolean;
    agentSAExists: boolean;
  };
}

export interface ClusterRequest {
  projectID: string;
}

export interface DeleteClusters {
  projectID: string;
  clusterIDs: string;
}
