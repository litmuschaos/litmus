import { gql, useQuery } from '@apollo/client';
import type { GetImageRegistryResponse } from '@api/entities';
import type { GqlAPIQueryRequest, GqlAPIQueryResponse } from '@api/types';

export interface GetImageRegistryRequest {
  projectID: string;
}

// TODO: Update this API to latest API structure with options
export function getImageRegistry({
  projectID,
  options = {}
}: GqlAPIQueryRequest<GetImageRegistryResponse, GetImageRegistryRequest>): GqlAPIQueryResponse<
  GetImageRegistryResponse,
  GetImageRegistryRequest
> {
  // Query to get chaosHub
  const { data, loading, ...rest } = useQuery<GetImageRegistryResponse, GetImageRegistryRequest>(
    gql`
      query getImageRegistry($projectID: String!) {
        getImageRegistry(projectID: $projectID) {
          imageRegistryInfo {
            isDefault
            enableRegistry
            secretName
            secretNamespace
            imageRegistryName
            imageRepoName
            imageRegistryType
          }
          imageRegistryID
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
