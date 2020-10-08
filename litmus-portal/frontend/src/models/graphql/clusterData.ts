export interface Cluster {
  cluster_id: string;
  project_id: string;
  cluster_name: string;
  description: String;
  platform_name: string;
  access_key: string;
  is_registered: boolean;
  is_cluster_confirmed: boolean;
  is_active: boolean;
  updated_at: string;
  created_at: string;
  cluster_type: string;
  no_of_workflows: number;
  no_of_schedules: number;
  token: string;
}

export interface Clusters {
  getCluster: Cluster[];
}

export interface CreateClusterInput {
  ClusterInput: {
    cluster_name: string;
    description: string;
    platform_name: string;
    project_id: string;
    cluster_type: string;
  };
}

export interface clusterRegResponse {
  token: string;
  cluster_id: string;
  cluster_name: string;
}

export interface CreateClusterInputResponse {
  userClusterReg: clusterRegResponse;
}

export interface ClusterVars {
  project_id: string;
}
