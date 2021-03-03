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

export const CREATE_USER = gql`
  mutation CreateUser($user: CreateUserInput!) {
    createUser(user: $user) {
      id
      username
      created_at
      updated_at
      removed_at
    }
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

export const DELETE_SCHEDULE = gql`
  mutation deleteWorkflow($workflow_id: String!) {
    deleteChaosWorkflow(workflowid: $workflow_id)
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
