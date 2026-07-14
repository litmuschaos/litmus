import { gql, useQuery } from '@apollo/client';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';
import type { GetGitOpsDetailResponse } from '@api/entities/gitops';

export interface GetGitOpsDetailsRequest {
  projectID: string;
}

// TODO: Update this API to latest API structure with options
export function getGitOpsDetails({
  projectID,
  options = {}
}: GqlAPIQueryRequest<GetGitOpsDetailResponse, GetGitOpsDetailsRequest>): GqlAPIQueryResponse<
  GetGitOpsDetailResponse,
  GetGitOpsDetailsRequest
> {
  // Query to get chaosHub
  const { data, loading, ...rest } = useQuery<GetGitOpsDetailResponse, GetGitOpsDetailsRequest>(
    gql`
      query getGitOpsDetails($projectID: ID!) {
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
    `,
    {
      variables: {
        projectID
      },
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return {
    data,
    loading: loading,
    ...rest
  };
}
