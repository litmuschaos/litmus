import { gql, useMutation } from '@apollo/client';
import type { ImageRegistry, ImageRegistryInfo } from '@api/entities';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface UpdateImageRegistryRequest {
  projectID: string;
  imageRegistryInfo: ImageRegistryInfo;
  imageRegistryID: string;
}

export interface UpdateImageRegistryResponse {
  updateImageRegistry: ImageRegistry;
}

export function updateImageRegistry(
  options?: GqlAPIMutationRequest<UpdateImageRegistryResponse, UpdateImageRegistryRequest>
): GqlAPIMutationResponse<UpdateImageRegistryResponse, UpdateImageRegistryRequest> {
  const [updateImageRegistryMutation, result] = useMutation<UpdateImageRegistryResponse, UpdateImageRegistryRequest>(
    gql`
      mutation updateImageRegistry(
        $imageRegistryID: String!
        $projectID: String!
        $imageRegistryInfo: ImageRegistryInput!
      ) {
        updateImageRegistry(
          imageRegistryID: $imageRegistryID
          projectID: $projectID
          imageRegistryInfo: $imageRegistryInfo
        ) {
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

  return [updateImageRegistryMutation, result];
}
