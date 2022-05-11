import { gql } from '@apollo/client';

// GetManifestTemplate
export const GET_MANIFEST_TEMPLATE = gql`
  query listWorkflowManifests($projectID: String!) {
    listWorkflowManifests(projectID: $projectID) {
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
  query getWorkflowManifestByID($projectID: String!, $templateID: String!) {
    getWorkflowManifestByID(templateID: $templateID, projectID: $projectID) {
      templateID
      templateName
      templateDescription
      manifest
    }
  }
`;
