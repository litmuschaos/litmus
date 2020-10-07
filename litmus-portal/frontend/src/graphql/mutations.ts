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

export const UPDATE_DETAILS = gql`
  mutation updateUser($user: UpdateUserInput!) {
    updateUser(user: $user)
  }
`;
