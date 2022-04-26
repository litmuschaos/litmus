import { gql } from '@apollo/client';

// ImageResgistry
export const ADD_IMAGE_REGISTRY = gql`
  mutation createImageRegistry(
    $projectID: String!
    $imageRegistryInfo: imageRegistryInput!
  ) {
    createImageRegistry(
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
`;

export const UPDATE_IMAGE_REGISTRY = gql`
  mutation updateImageRegistry(
    $imageRegistryID: String!
    $projectID: String!
    $imageRegistryInfo: imageRegistryInput!
  ) {
    updateImageRegistry(
      imageRegistryID: $imageRegistryID
      projectID: $projectID
      imageRegistryInfo: $imageRegistryInfo
    ) {
      imageRegistry_info {
        imageRepoName
        imageRegistryName
        imageRegistryType
        isDefault
      }
    }
  }
`;
