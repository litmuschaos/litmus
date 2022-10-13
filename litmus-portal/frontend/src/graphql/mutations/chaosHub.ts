import { gql } from '@apollo/client';

// chaosHub (Change mutation name to add_chaos_hub)
export const ADD_MY_HUB = gql`
  mutation addChaosHub($request: CreateChaosHubRequest!) {
    addChaosHub(request: $request) {
      hubName
      repoURL
      repoBranch
    }
  }
`;

export const ADD_REMOTE_MY_HUB = gql`
  mutation addRemoteChaosHub($request: CreateRemoteMyHub!) {
    addRemoteChaosHub(request: $request) {
      hubName
      repoURL
      repoBranch
    }
  }
`;

export const UPDATE_MY_HUB = gql`
  mutation updateChaosHub($request: UpdateChaosHubRequest!) {
    updateChaosHub(request: $request) {
      hubName
      repoURL
      repoBranch
    }
  }
`;

export const SYNC_REPO = gql`
  mutation syncChaosHub($id: ID!, $projectID: String!) {
    syncChaosHub(id: $id, projectID: $projectID)
  }
`;

export const DELETE_HUB = gql`
  mutation deleteChaosHub($hubID: String!, $projectID: String!) {
    deleteChaosHub(hubID: $hubID, projectID: $projectID)
  }
`;

export const GENERATE_SSH = gql`
  mutation generateSSHKey {
    generateSSHKey {
      privateKey
      publicKey
    }
  }
`;
