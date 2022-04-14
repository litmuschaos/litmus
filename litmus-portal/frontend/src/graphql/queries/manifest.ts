import { gql } from '@apollo/client';

// listManifestTemplate
export const LIST_MANIFEST_TEMPLATE = gql`
  query ListManifestTemplate($data: String!) {
    ListManifestTemplate(projectID: $data) {
      templateID
      manifest
      projectName
      templateDescription
      templateName
      isCustomWorkflow
    }
  }
`;

export const GET_TEMPLATE_BY_ID = gql`
  query GetManifestTemplate($data: String!) {
    getTemplateManifestByID(templateID: $data) {
      templateID
      templateName
      templateDescription
      manifest
    }
  }
`;
