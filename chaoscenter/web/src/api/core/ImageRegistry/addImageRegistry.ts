import { gql, useMutation } from '@apollo/client';
import type { AddImageRegistryRequest, CreateImageRegistryResponse } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export function addImageRegistry(
  options?: GqlAPIMutationRequest<CreateImageRegistryResponse, AddImageRegistryRequest>
): GqlAPIMutationResponse<CreateImageRegistryResponse, AddImageRegistryRequest> {
  const [addImageRegistryMutation, result] = useMutation<CreateImageRegistryResponse, AddImageRegistryRequest>(
    gql`
      mutation createImageRegistry($projectID: String!, $imageRegistryInfo: ImageRegistryInput!) {
        createImageRegistry(projectID: $projectID, imageRegistryInfo: $imageRegistryInfo) {
          imageRegistryInfo {
            imageRepoName
            imageRegistryName
            imageRegistryType
            isDefault
          }
        }
      }
    `,
    options
  );

  return [addImageRegistryMutation, result];
}
