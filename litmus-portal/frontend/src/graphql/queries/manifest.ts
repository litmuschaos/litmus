import { gql } from '@apollo/client';

// GetManifestTemplate
export const GET_MANIFEST_TEMPLATE = gql`
  query getWorkflowManifests($projectID: String!) {
    getWorkflowManifests(projectID: $projectID) {
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
  query GetWorkflowManifestByID($projectID: String!, $templateID: String!) {
    GetWorkflowManifestByID(templateID: $templateID, projectID: $projectID) {
      templateID
      templateName
      templateDescription
      manifest
    }
  }
`;
