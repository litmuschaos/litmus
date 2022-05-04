import { gql } from '@apollo/client';

// chaosHub (Change mutation name to add_chaos_hub)
export const ADD_MY_HUB = gql`
  mutation addChaosHub($request: CreateMyHub!, $projectID: String!) {
    addChaosHub(request: $request, projectID: $projectID) {
      hubName
      repoURL
      repoBranch
    }
  }
`;

export const UPDATE_MY_HUB = gql`
  mutation updateChaosHub($request: UpdateMyHub!, $projectID: String!) {
    updateChaosHub(request: $request, projectID: $projectID) {
      hubName
      repoURL
      repoBranch
    }
  }
`;

export const SYNC_REPO = gql`
  mutation syncChaosHub($id: ID!, $projectID: String!) {
    syncChaosHub(id: $id, projectID: $projectID) {
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
  mutation deleteChaosHub($hubID: String!, $projectID: String!) {
    deleteChaosHub(hubID: $hubID, projectID: $projectID)
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
