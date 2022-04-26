import { gql } from '@apollo/client';

export const CREATE_DATASOURCE = gql`
  mutation createDataSource($DSInput: DSInput) {
    createDataSource(datasource: $DSInput) {
      dsID
      dsName
      dsType
      dsURL
      accessType
      authType
      basicAuthUsername
      basicAuthPassword
      scrapeInterval
      queryTimeout
      httpMethod
      projectID
      healthStatus
    }
  }
`;

export const UPDATE_DATASOURCE = gql`
  mutation updateDataSource($DSInput: DSInput!) {
    updateDataSource(datasource: $DSInput) {
      dsID
      dsName
      dsType
      dsURL
      accessType
      authType
      basicAuthUsername
      basicAuthPassword
      scrapeInterval
      queryTimeout
      httpMethod
      projectID
    }
  }
`;

export const DELETE_DATASOURCE = gql`
  mutation deleteDataSource(
    $projectID: String!
    $deleteDSInput: deleteDSInput!
  ) {
    deleteDataSource(projectID: $projectID, input: $deleteDSInput)
  }
`;

export const CREATE_DASHBOARD = gql`
  mutation createDashBoard($createDBInput: createDBInput) {
    createDashBoard(dashboard: $createDBInput) {
      dbID
    }
  }
`;

export const UPDATE_DASHBOARD = gql`
  mutation updateDashboard(
    $projectID: String!
    $updateDBInput: updateDBInput!
    $chaosQueryUpdate: Boolean!
  ) {
    updateDashboard(
      projectID: $projectID
      dashboard: $updateDBInput
      chaosQueryUpdate: $chaosQueryUpdate
    )
  }
`;

export const DELETE_DASHBOARD = gql`
  mutation deleteDashboard($projectID: String!, $dbID: String) {
    deleteDashboard(projectID: $projectID, dbID: $dbID)
  }
`;

export const UPDATE_PANEL = gql`
  mutation updatePanel($panelInput: [panel]) {
    updatePanel(panelInput: $panelInput)
  }
`;
