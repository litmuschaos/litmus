import { gql } from '@apollo/client';

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

export const ADD_WORKFLOW_TEMPLATE = gql`
  mutation addWorkflowTemplate($data: TemplateInput!) {
    createManifestTemplate(templateInput: $data) {
      template_name
      template_id
    }
  }
`;

export const DELETE_WORKFLOW_TEMPLATE = gql`
  mutation deleteManifestTemplate($data: String!) {
    deleteManifestTemplate(template_id: $data)
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($user: CreateUserInput!) {
    createUser(user: $user) {
      username
      created_at
      updated_at
      deactivated_at
    }
  }
`;

export const UPDATE_USER_STATE = gql`
  mutation updateUserState($uid: String!, $isDeactivate: Boolean!) {
    updateUserState(uid: $uid, isDeactivate: $isDeactivate)
  }
`;

export const CREATE_PROJECT = gql`
  mutation createProject($projectName: String!) {
    createProject(projectName: $projectName) {
      members {
        user_id
        role
        user_name
        invitation
        joined_at
      }
      name
      id
    }
  }
`;

export const UPDATE_PROJECT_NAME = gql`
  mutation updateProjectName($projectID: String!, $projectName: String!) {
    updateProjectName(projectID: $projectID, projectName: $projectName)
  }
`;

export const SEND_INVITE = gql`
  mutation sendInvite($member: MemberInput!) {
    sendInvitation(member: $member) {
      user_id
      user_name
      role
      invitation
    }
  }
`;

export const REMOVE_INVITATION = gql`
  mutation RemoveInvitation($data: MemberInput!) {
    removeInvitation(member: $data)
  }
`;

export const ACCEPT_INVITE = gql`
  mutation accept($member: MemberInput!) {
    acceptInvitation(member: $member)
  }
`;

export const DECLINE_INVITE = gql`
  mutation decline($member: MemberInput!) {
    declineInvitation(member: $member)
  }
`;

export const UPDATE_SCHEDULE = gql`
  mutation updateChaos($ChaosWorkFlowInput: ChaosWorkFlowInput!) {
    updateChaosWorkflow(input: $ChaosWorkFlowInput) {
      workflow_id
      workflow_name
      workflow_description
      isCustomWorkflow
      cronSyntax
    }
  }
`;

export const UPDATE_DETAILS = gql`
  mutation updateUser($user: UpdateUserInput!) {
    updateUser(user: $user)
  }
`;

export const USER_CLUSTER_REG = gql`
  mutation userCluster($ClusterInput: ClusterInput!) {
    userClusterReg(clusterInput: $ClusterInput) {
      token
      cluster_id
      cluster_name
    }
  }
`;

export const ADD_MY_HUB = gql`
  mutation addMyHub($MyHubDetails: CreateMyHub!, $projectID: String!) {
    addMyHub(myhubInput: $MyHubDetails, projectID: $projectID) {
      HubName
      RepoURL
      RepoBranch
    }
  }
`;

export const SAVE_MY_HUB = gql`
  mutation saveMyHub($MyHubDetails: CreateMyHub!, $projectID: String!) {
    saveMyHub(myhubInput: $MyHubDetails, projectID: $projectID) {
      HubName
      RepoURL
      RepoBranch
    }
  }
`;

export const UPDATE_MY_HUB = gql`
  mutation updateMyHub($MyHubDetails: UpdateMyHub!, $projectID: String!) {
    updateMyHub(myhubInput: $MyHubDetails, projectID: $projectID) {
      HubName
      RepoURL
      RepoBranch
    }
  }
`;

export const SYNC_REPO = gql`
  mutation syncHub($id: ID!) {
    syncHub(id: $id) {
      id
      RepoURL
      RepoBranch
      IsAvailable
      TotalExp
      HubName
    }
  }
`;

export const DELETE_HUB = gql`
  mutation deleteMyHub($hub_id: String!) {
    deleteMyHub(hub_id: $hub_id)
  }
`;

export const GENERATE_SSH = gql`
  mutation generateSSHKey {
    generaterSSHKey {
      privateKey
      publicKey
    }
  }
`;

export const DELETE_CLUSTER = gql`
  mutation deleteCluster($cluster_id: String!) {
    deleteClusterReg(cluster_id: $cluster_id)
  }
`;

export const ENABLE_GITOPS = gql`
  mutation enableGitOps($gitConfig: GitConfig!) {
    enableGitOps(config: $gitConfig)
  }
`;

export const UPDATE_GITOPS = gql`
  mutation updateGitOps($gitConfig: GitConfig!) {
    updateGitOps(config: $gitConfig)
  }
`;

export const DISABLE_GITOPS = gql`
  mutation disableGitOPs($data: String!) {
    disableGitOps(project_id: $data)
  }
`;

export const RERUN_CHAOS_WORKFLOW = gql`
  mutation rerunChaosWorkflow($data: String!) {
    reRunChaosWorkFlow(workflowID: $data)
  }
`;

export const LEAVE_PROJECT = gql`
  mutation LeaveProject($data: MemberInput!) {
    leaveProject(member: $data)
  }
`;

export const CREATE_DATASOURCE = gql`
  mutation createDataSource($DSInput: DSInput) {
    createDataSource(datasource: $DSInput) {
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
      health_status
    }
  }
`;

export const UPDATE_DATASOURCE = gql`
  mutation updateDataSource($DSInput: DSInput!) {
    updateDataSource(datasource: $DSInput) {
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
    }
  }
`;

export const DELETE_DATASOURCE = gql`
  mutation deleteDataSource($deleteDSInput: deleteDSInput!) {
    deleteDataSource(input: $deleteDSInput)
  }
`;

export const CREATE_DASHBOARD = gql`
  mutation createDashBoard($createDBInput: createDBInput) {
    createDashBoard(dashboard: $createDBInput) {
      db_id
    }
  }
`;

export const UPDATE_DASHBOARD = gql`
  mutation updateDashboard(
    $updateDBInput: updateDBInput!
    $chaosQueryUpdate: Boolean!
  ) {
    updateDashboard(
      dashboard: $updateDBInput
      chaosQueryUpdate: $chaosQueryUpdate
    )
  }
`;

export const DELETE_DASHBOARD = gql`
  mutation deleteDashboard($dbID: String) {
    deleteDashboard(db_id: $dbID)
  }
`;

export const UPDATE_PANEL = gql`
  mutation updatePanel($panelInput: [panel]) {
    updatePanel(panelInput: $panelInput)
  }
`;

export const ADD_IMAGE_REGISTRY = gql`
  mutation createImageRegistry(
    $projectID: String!
    $imageRegistryInfo: imageRegistryInput!
  ) {
    createImageRegistry(
      project_id: $projectID
      imageRegistryInfo: $imageRegistryInfo
    ) {
      image_registry_info {
        image_repo_name
        image_registry_name
        image_registry_type
        is_default
      }
    }
  }
`;

export const UPDATE_IMAGE_REGISTRY = gql`
  mutation updateImageRegistry(
    $imageRegistryID: String!
    $projectID: String!
    $imageRegistryInfo: imageRegistryInput!
  ) {
    updateImageRegistry(
      image_registry_id: $imageRegistryID
      project_id: $projectID
      imageRegistryInfo: $imageRegistryInfo
    ) {
      image_registry_info {
        image_repo_name
        image_registry_name
        image_registry_type
        is_default
      }
    }
  }
`;

export const SYNC_WORKFLOW = gql`
  mutation syncWorkflow($workflowid: String!, $workflow_run_id: String!) {
    syncWorkflow(workflowid: $workflowid, workflow_run_id: $workflow_run_id)
  }
`;

export const DELETE_WORKFLOW = gql`
  mutation deleteWorkflow($workflowid: String!, $workflow_run_id: String!) {
    deleteChaosWorkflow(
      workflowid: $workflowid
      workflow_run_id: $workflow_run_id
    )
  }
`;
