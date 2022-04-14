import { gql } from '@apollo/client';

// getGitOpsDetails
export const GET_GITOPS_DATA = gql`
  query gitOpsData($data: String!) {
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
