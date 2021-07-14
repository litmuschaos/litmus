import { gql } from '@apollo/client';

export const WORKFLOW_DETAILS_WITH_EXEC_DATA = gql`
  query workflowDetails($workflowRunsInput: GetWorkflowRunsInput!) {
    getWorkflowRuns(workflowRunsInput: $workflowRunsInput) {
      total_no_of_workflow_runs
      workflow_runs {
        workflow_id
        workflow_name
        workflow_run_id
        cluster_name
        last_updated
        cluster_id
        phase
        execution_data
        resiliency_score
        isRemoved
      }
    }
  }
`;

export const WORKFLOW_DETAILS = gql`
  query workflowDetails($workflowRunsInput: GetWorkflowRunsInput!) {
    getWorkflowRuns(workflowRunsInput: $workflowRunsInput) {
      total_no_of_workflow_runs
      workflow_runs {
        workflow_run_id
        workflow_id
        cluster_name
        last_updated
        project_id
        cluster_id
        workflow_name
        cluster_type
        phase
        resiliency_score
        experiments_passed
        experiments_failed
        experiments_awaited
        experiments_stopped
        experiments_na
        total_experiments
        isRemoved
      }
    }
  }
`;

export const WORKFLOW_RUN_DETAILS = gql`
  query workflowDetails($workflowRunsInput: GetWorkflowRunsInput!) {
    getWorkflowRuns(workflowRunsInput: $workflowRunsInput) {
      total_no_of_workflow_runs
      workflow_runs {
        weightages {
          experiment_name
          weightage
        }
        workflow_id
        workflow_name
        workflow_run_id
        cluster_name
        execution_data
        last_updated
        phase
        resiliency_score
        experiments_passed
        total_experiments
        isRemoved
      }
    }
  }
`;

export const WORKFLOW_STATS = gql`
  query getWorkflowStats(
    $filter: TimeFrequency!
    $project_id: ID!
    $show_workflow_runs: Boolean!
  ) {
    getWorkflowStats(
      filter: $filter
      project_id: $project_id
      show_workflow_runs: $show_workflow_runs
    ) {
      date
      value
    }
  }
`;

export const STACKED_BAR_GRAPH = gql`
  query workflowDetails($workflowRunsInput: GetWorkflowRunsInput!) {
    getWorkflowRuns(workflowRunsInput: $workflowRunsInput) {
      total_no_of_workflow_runs
      workflow_runs {
        workflow_run_id
        workflow_name
        last_updated
        total_experiments
        experiments_passed
        resiliency_score
      }
    }
  }
`;
export const WORKFLOW_LIST_DETAILS = gql`
  query workflowListDetails($workflowInput: ListWorkflowsInput!) {
    ListWorkflow(workflowInput: $workflowInput) {
      total_no_of_workflows
      workflows {
        workflow_id
        workflow_manifest
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
        isRemoved
      }
    }
  }
`;

export const WORKFLOW_LIST_DETAILS_FOR_MANIFEST = gql`
  query workflowListDetails($projectID: String!, $workflowIDs: [ID]) {
    ListWorkflow(project_id: $projectID, workflow_ids: $workflowIDs) {
      workflow_id
      workflow_manifest
      workflow_name
    }
  }
`;

export const GET_WORKFLOW_RUNS_STATS = gql`
  query getWorkflowRunStats(
    $workflowRunStatsRequest: WorkflowRunStatsRequest!
  ) {
    getWorkflowRunStats(workflowRunStatsRequest: $workflowRunStatsRequest) {
      total_workflow_runs
      succeeded_workflow_runs
      failed_workflow_runs
      running_workflow_runs
      workflow_run_succeeded_percentage
      workflow_run_failed_percentage
      average_resiliency_score
      passed_percentage
      failed_percentage
      total_experiments
      experiments_passed
      experiments_failed
      experiments_awaited
      experiments_stopped
      experiments_na
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
      company_name
      updated_at
      created_at
      deactivated_at
      is_email_verified
      role
    }
  }
`;

export const GET_USER_INFO = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      username
      email
      id
      name
    }
  }
`;

export const GET_CLUSTER = gql`
  query getClusters($project_id: String!, $cluster_type: String) {
    getCluster(project_id: $project_id, cluster_type: $cluster_type) {
      cluster_id
      cluster_name
      description
      is_active
      is_registered
      is_cluster_confirmed
      updated_at
      created_at
      cluster_type
      no_of_schedules
      no_of_workflows
      token
      last_workflow_timestamp
      agent_namespace
    }
  }
`;

export const GET_CLUSTER_LENGTH = gql`
  query getClusters($project_id: String!) {
    getCluster(project_id: $project_id) {
      cluster_id
    }
  }
`;

export const GET_CLUSTER_NAMES = gql`
  query getClusters($project_id: String!) {
    getCluster(project_id: $project_id) {
      cluster_name
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
      created_at
      deactivated_at
    }
  }
`;

export const CORE_CHART_FIELDS = gql`
  fragment CoreChartFields on Chart {
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
  }
`;

export const GET_CHARTS_DATA = gql`
  ${CORE_CHART_FIELDS}
  query getCharts($HubName: String!, $projectID: String!) {
    getCharts(HubName: $HubName, projectID: $projectID) {
      ...CoreChartFields
    }
  }
`;

export const GET_EXPERIMENT_DATA = gql`
  ${CORE_CHART_FIELDS}
  query getExperiment($data: ExperimentInput!) {
    getHubExperiment(experimentInput: $data) {
      ...CoreChartFields
    }
  }
`;

export const GET_HUB_STATUS = gql`
  query getHubStatus($data: String!) {
    getHubStatus(projectID: $data) {
      id
      HubName
      RepoBranch
      RepoURL
      TotalExp
      IsAvailable
      AuthType
      IsPrivate
      Token
      UserName
      Password
      SSHPrivateKey
      SSHPublicKey
      LastSyncedAt
    }
  }
`;

export const GET_ENGINE_YAML = gql`
  query getEngineData($experimentInput: ExperimentInput!) {
    getYAMLData(experimentInput: $experimentInput)
  }
`;

export const GET_EXPERIMENT_YAML = gql`
  query getExperimentData($experimentInput: ExperimentInput!) {
    getYAMLData(experimentInput: $experimentInput)
  }
`;

export const GET_GITOPS_DATA = gql`
  query gitOPsData($data: String!) {
    getGitOpsDetails(project_id: $data) {
      Enabled
      ProjectID
      Branch
      RepoURL
      AuthType
      Token
      UserName
      Password
      SSHPrivateKey
    }
  }
`;

export const LIST_MANIFEST_TEMPLATE = gql`
  query ListManifestTemplate($data: String!) {
    ListManifestTemplate(project_id: $data) {
      template_id
      manifest
      project_name
      template_description
      template_name
      isCustomWorkflow
    }
  }
`;

export const LIST_PROJECTS = gql`
  query listProjects {
    listProjects {
      id
      name
      members {
        user_name
        user_id
        role
        invitation
        joined_at
        deactivated_at
      }
      created_at
      updated_at
      removed_at
    }
  }
`;

export const GET_PROJECT = gql`
  query getProject($projectID: String!) {
    getProject(projectID: $projectID) {
      id
      name
      members {
        user_id
        user_name
        role
        invitation
        joined_at
        deactivated_at
      }
      created_at
      updated_at
      removed_at
    }
  }
`;

export const GET_PROJECT_NAME = gql`
  query getProject($projectID: String!) {
    getProject(projectID: $projectID) {
      name
    }
  }
`;

export const LIST_DATASOURCE = gql`
  query listDataSource($projectID: String!) {
    ListDataSource(project_id: $projectID) {
      ds_id
      ds_name
      ds_type
      ds_url
      access_type
      auth_type
      basic_auth_username
      basic_auth_password
      scrape_interval
      query_timeout
      http_method
      project_id
      created_at
      updated_at
      health_status
    }
  }
`;

export const LIST_DATASOURCE_OVERVIEW = gql`
  query listDataSource($projectID: String!) {
    ListDataSource(project_id: $projectID) {
      ds_id
    }
  }
`;

export const GET_PORTAL_DASHBOARDS = gql`
  query getPortalDashboards($projectID: String!, $hubName: String!) {
    PortalDashboardData(project_id: $projectID, hub_name: $hubName) {
      name
      dashboard_data
    }
  }
`;

export const LIST_DASHBOARD = gql`
  query listDashboard($projectID: String!, $clusterID: String, $dbID: String) {
    ListDashboard(
      project_id: $projectID
      cluster_id: $clusterID
      db_id: $dbID
    ) {
      db_id
      ds_id
      db_name
      cluster_name
      ds_name
      ds_type
      ds_url
      ds_health_status
      db_type_id
      db_type_name
      db_information
      chaos_event_query_template
      chaos_verdict_query_template
      application_metadata_map {
        namespace
        applications {
          kind
          names
        }
      }
      panel_groups {
        panels {
          panel_id
          created_at
          prom_queries {
            queryid
            prom_query_name
            legend
            resolution
            minstep
            line
            close_area
          }
          panel_options {
            points
            grids
            left_axis
          }
          panel_name
          y_axis_left
          y_axis_right
          x_axis_down
          unit
        }
        panel_group_name
        panel_group_id
      }
      end_time
      start_time
      refresh_rate
      project_id
      cluster_id
      viewed_at
    }
  }
`;

export const LIST_DASHBOARD_OVERVIEW = gql`
  query listDashboard($projectID: String!, $clusterID: String, $dbID: String) {
    ListDashboard(
      project_id: $projectID
      cluster_id: $clusterID
      db_id: $dbID
    ) {
      db_id
      db_name
      db_type_id
      db_type_name
      cluster_name
      cluster_id
      viewed_at
      db_information
      chaos_event_query_template
      chaos_verdict_query_template
      application_metadata_map {
        namespace
        applications {
          kind
          names
        }
      }
      panel_groups {
        panels {
          panel_id
          created_at
          prom_queries {
            queryid
            prom_query_name
            legend
            resolution
            minstep
            line
            close_area
          }
          panel_options {
            points
            grids
            left_axis
          }
          panel_name
          y_axis_left
          y_axis_right
          x_axis_down
          unit
        }
        panel_group_name
        panel_group_id
      }
    }
  }
`;

export const PROM_QUERY = gql`
  query PrometheusQuery($prometheusInput: promInput) {
    GetPromQuery(query: $prometheusInput) {
      metricsResponse {
        queryid
        legends
        tsvs {
          date
          value
        }
      }
      annotationsResponse {
        queryid
        legends
        tsvs {
          date
          value
        }
      }
    }
  }
`;

export const PROM_LABEL_VALUES = gql`
  query PrometheusLabelValues($prometheusInput: promSeriesInput) {
    GetPromLabelNamesAndValues(series: $prometheusInput) {
      series
      labelValues {
        label
        values {
          name
        }
      }
    }
  }
`;

export const PROM_SERIES_LIST = gql`
  query PrometheusSeriesList($prometheusDSInput: dsDetails) {
    GetPromSeriesList(ds_details: $prometheusDSInput) {
      seriesList
    }
  }
`;

export const GET_TEMPLATE_BY_ID = gql`
  query GetManifestTemplate($data: String!) {
    GetTemplateManifestByID(template_id: $data) {
      template_id
      template_name
      template_description
      manifest
    }
  }
`;

export const GET_PREDEFINED_WORKFLOW_LIST = gql`
  query GetPredefinedWorkflowList($hubname: String!, $projectid: String!) {
    GetPredefinedWorkflowList(HubName: $hubname, projectID: $projectid)
  }
`;

export const GET_PREDEFINED_EXPERIMENT_YAML = gql`
  query GetPredefinedExperimentYAML($experimentInput: ExperimentInput!) {
    GetPredefinedExperimentYAML(experimentInput: $experimentInput)
  }
`;

export const LIST_IMAGE_REGISTRY = gql`
  query ListImageRegistry($data: String!) {
    ListImageRegistry(project_id: $data) {
      image_registry_info {
        enable_registry
        is_default
      }
      image_registry_id
    }
  }
`;

export const GET_IMAGE_REGISTRY = gql`
  query GetImageRegistry($registryid: String!, $projectid: String!) {
    GetImageRegistry(image_registry_id: $registryid, project_id: $projectid) {
      image_registry_info {
        is_default
        enable_registry
        secret_name
        secret_namespace
        image_registry_name
        image_repo_name
        image_registry_type
      }
      image_registry_id
    }
  }
`;

export const GET_GLOBAL_STATS = gql`
  query getGlobalStats($query: UsageQuery!) {
    UsageQuery(query: $query) {
      TotalCount {
        Workflows {
          Runs
          ExpRuns
          Schedules
        }
        Agents {
          Ns
          Cluster
          Total
        }
        Projects
        Users
      }
    }
  }
`;

export const GLOBAL_PROJECT_DATA = gql`
  query getStats($query: UsageQuery!) {
    UsageQuery(query: $query) {
      TotalCount {
        Projects
      }
      Projects {
        Name
        Workflows {
          Schedules
          ExpRuns
          Runs
        }
        Agents {
          Total
          Ns
          Cluster
        }
        Members {
          Owner {
            Name
            Username
          }
          Total
        }
      }
    }
  }
`;
