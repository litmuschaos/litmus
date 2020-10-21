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
      cluster_type
      cluster_id
    }
  }
`;

export const SCHEDULE_DETAILS = gql`
  query scheduleDetails($projectID: String!) {
    getScheduledWorkflows(project_id: $projectID) {
      workflow_id
      workflow_manifest
      cronSyntax
      workflow_name
      workflow_description
      weightages {
        experiment_name
        weightage
      }
      isCustomWorkflow
      updated_at
      created_at
      project_id
      cluster_id
      cluster_type
      cluster_name
    }
  }
`;

export const WORKFLOW_LIST_DETAILS = gql`
  query workflowListDetails($projectID: String!, $workflowIDs: [ID]) {
    ListWorkflow(project_id: $projectID, workflow_ids: $workflowIDs) {
      workflow_id
      cronSyntax
      cluster_name
      workflow_name
      workflow_description
      weightages {
        experiment_name
        weightage
      }
      isCustomWorkflow
      updated_at
      created_at
      project_id
      cluster_id
      cluster_type
      workflow_runs {
        execution_data
        workflow_run_id
        last_updated
      }
    }
  }
`;

export const GET_USER = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      username
      email
      id
      name
      projects {
        members {
          user_id
          user_name
          role
          invitation
          name
          email
          joined_at
        }
        name
        id
      }
      my_hub {
        HubName
        GitURL
        GitBranch
      }
      company_name
      updated_at
      created_at
      removed_at
      is_email_verified
      state
      role
    }
  }
`;

export const GET_CLUSTER = gql`
  query getClusters($project_id: String!, $cluster_type: String) {
    getCluster(project_id: $project_id, cluster_type: $cluster_type) {
      cluster_id
      is_active
      project_id
      cluster_name
      description
      platform_name
      access_key
      is_registered
      is_cluster_confirmed
      updated_at
      created_at
      cluster_type
      no_of_schedules
      no_of_workflows
      token
    }
  }
`;

export const ALL_USERS = gql`
  query allUsers {
    users {
      id
      name
      username
      email
    }
  }
`;

export const GET_CHARTS_DATA = gql`
  query getCharts($data: ChartsInput!) {
    getCharts(chartsInput: $data) {
      ApiVersion
      Kind
      Metadata {
        Name
        Version
        Annotations {
          Categories
          Vendor
          CreatedAt
          Repository
          Support
          ChartDescription
        }
      }
      Spec {
        DisplayName
        CategoryDescription
        Keywords
        Maturity
        Experiments
        Maintainers {
          Name
          Email
        }
        MinKubeVersion
        Provider
        Links {
          Name
          Url
        }
        ChaosExpCRDLink
        Platforms
        ChaosType
      }
      PackageInfo {
        PackageName
        Experiments {
          Name
          CSV
          Desc
        }
      }
      Experiments {
        ApiVersion
      }
    }
  }
`;
