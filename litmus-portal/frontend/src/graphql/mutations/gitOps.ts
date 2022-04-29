import { gql } from '@apollo/client';

// gitOps
export const ENABLE_GITOPS = gql`
  mutation enableGitOps($config: GitConfigResponse!) {
    enableGitOps(config: $config)
  }
`;

export const UPDATE_GITOPS = gql`
  mutation updateGitOps($config: GitConfigResponse!) {
    updateGitOps(config: $config)
  }
`;

export const DISABLE_GITOPS = gql`
  mutation disableGitOps($projectID: String!) {
    disableGitOps(projectID: $data)
  }
`;
