import { gql, useQuery } from '@apollo/client';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';

export interface GetVersionDetailsRequest {
  projectID: string;
}

export interface VersionDetails {
  latestVersion: string;
  compatibleVersions: Array<string>;
}

export interface GetVersionDetailsResponse {
  getVersionDetails: VersionDetails;
}

export function getVersionDetails({
  // Identifiers
  projectID,
  // Options
  options = {}
}: GqlAPIQueryRequest<GetVersionDetailsResponse, GetVersionDetailsRequest>): GqlAPIQueryResponse<
  GetVersionDetailsResponse,
  GetVersionDetailsRequest
> {
  const { data, loading, ...rest } = useQuery<GetVersionDetailsResponse, GetVersionDetailsRequest>(
    gql`
      query getVersionDetails($projectID: ID!) {
        getVersionDetails(projectID: $projectID) {
          latestVersion
          compatibleVersions
        }
      }
    `,
    {
      variables: {
        projectID
      },
      ...options
    }
  );

  return {
    data,
    loading: loading,
    ...rest
  };
}
