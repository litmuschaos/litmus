import { gql } from '@apollo/client';

// listImageRegistry
export const LIST_IMAGE_REGISTRY = gql`
  query ListImageRegistry($data: String!) {
    listImageRegistry(projectID: $data) {
      imageRegistryInfo {
        enableRegistry
        isDefault
      }
      imageRegistryID
    }
  }
`;

// getImageRegistry
export const GET_IMAGE_REGISTRY = gql`
  query GetImageRegistry($imageRegistryID: String!, $projectID: String!) {
    getImageRegistry(imageRegistryID: $imageRegistryID, projectID: $projectID) {
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
`;
