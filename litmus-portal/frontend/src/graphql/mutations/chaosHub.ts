import { gql } from '@apollo/client';

// chaosHub (Change mutation name to add_chaos_hub)
export const ADD_MY_HUB = gql`
  mutation addMyHub($myHubInput: CreateMyHub!, $projectID: String!) {
    addMyHub(myhubInput: $myHubInput, projectID: $projectID) {
      hubName
      repoURL
      repoBranch
    }
  }
`;

export const UPDATE_MY_HUB = gql`
  mutation updateMyHub($myHubInput: UpdateMyHub!, $projectID: String!) {
    updateMyHub(myhubInput: $myHubInput, projectID: $projectID) {
      hubName
      repoURL
      repoBranch
    }
  }
`;

export const SYNC_REPO = gql`
  mutation syncHub($id: ID!, $projectID: String!) {
    syncHub(id: $id, projectID: $projectID) {
      id
      repoURL
      repoBranch
      isAvailable
      totalExp
      hubName
    }
  }
`;

export const DELETE_HUB = gql`
  mutation deleteMyHub($hubID: String!, $projectID: String!) {
    deleteMyHub(hubID: $hubID, projectID: $projectID)
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
