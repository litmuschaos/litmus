import { gql } from '@apollo/client';

export const ADD_WORKFLOW_TEMPLATE = gql`
  mutation createWorkflowTemplate($request: TemplateInput!) {
    createWorkflowTemplate(request: $request) {
      templateName
      templateID
    }
  }
`;

export const DELETE_WORKFLOW_TEMPLATE = gql`
  mutation deleteWorkflowTemplate($projectID: String!, $templateID: String!) {
    deleteWorkflowTemplate(projectID: $projectID, templateID: $templateID)
  }
`;

export const DELETE_CLUSTERS = gql`
  mutation deleteClusters($projectID: String!, $clusterIDs: [String]!) {
    deleteClusters(projectID: $projectID, clusterIDs: $clusterIDs)
  }
`;
