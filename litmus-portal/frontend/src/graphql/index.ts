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
    }
  }
`;

export const WORKFLOW_EVENTS = gql`
  subscription workflowEvents($projectID: String!) {
    workflowEventListener(project_id: $projectID) {
      workflow_id
      workflow_name
      workflow_run_id
      execution_data
      project_id
      cluster_name
      last_updated
    }
  }
`;

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
  mutation CreateUser($user: UserInput!) {
    createUser(user: $user) {
      id
      username
      created_at
      updated_at
      removed_at
    }
  }
`;

export const GET_USER = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      username
      email
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
      removed_at
      is_email_verified
      state
      role
    }
  }
`;

export const GET_CLUSTER = gql`
  query getCluster($project_id: String!, $cluster_type: String) {
    getCluster(project_id: $project_id, cluster_type: $cluster_type) {
      cluster_id
      is_active
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
