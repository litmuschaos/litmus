import { gql } from '@apollo/client';

// gitOps
export const ENABLE_GITOPS = gql`
  mutation enableGitOps($config: GitConfig!) {
    enableGitOps(config: $config)
  }
`;

export const UPDATE_GITOPS = gql`
  mutation updateGitOps($config: GitConfig!) {
    updateGitOps(config: $config)
  }
`;

export const DISABLE_GITOPS = gql`
  mutation disableGitOps($projectID: String!) {
    disableGitOps(projectID: $data)
  }
`;
