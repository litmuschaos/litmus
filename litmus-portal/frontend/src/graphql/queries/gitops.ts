import { gql } from '@apollo/client';

// getGitOpsDetails
export const GET_GITOPS_DATA = gql`
  query getGitOpsDetails($projectID: String!) {
    getGitOpsDetails(projectID: $projectID) {
      enabled
      projectID
      branch
      repoURL
      authType
      token
      userName
      password
      sshPrivateKey
    }
  }
`;
