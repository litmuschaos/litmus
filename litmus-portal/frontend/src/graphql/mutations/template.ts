import { gql } from '@apollo/client';

export const ADD_WORKFLOW_TEMPLATE = gql`
  mutation createManifestTemplate($templateInput: TemplateInput!) {
    createManifestTemplate(templateInput: $templateInput) {
      templateName
      templateID
    }
  }
`;

export const DELETE_WORKFLOW_TEMPLATE = gql`
  mutation deleteManifestTemplate($projectID: String!, $templateID: String!) {
    deleteManifestTemplate(projectID: $projectID, templateID: $templateID)
  }
`;

export const DELETE_CLUSTERS = gql`
  mutation deleteClusters($projectID: String!, $clusterIDs: [String]!) {
    deleteClusters(projectID: $projectID, clusterIDs: $clusterIDs)
  }
`;
