import { gql } from '@apollo/client';

// getHubStatus
export const CORE_CHART_FIELDS = gql`
  fragment CoreChartFields on Chart {
    ApiVersion
    Kind
    Metadata {
      Name
      Version
      Annotations {
        Categories
        Vendor
        CreatedAt
        Repository
        Support
        ChartDescription
      }
    }
    Spec {
      DisplayName
      CategoryDescription
      Keywords
      Maturity
      Experiments
      Maintainers {
        Name
        Email
      }
      MinKubeVersion
      Provider
      Links {
        Name
        Url
      }
      ChaosExpCRDLink
      Platforms
      ChaosType
    }
    PackageInfo {
      PackageName
      Experiments {
        Name
        CSV
        Desc
      }
    }
  }
`;

export const GET_CHARTS_DATA = gql`
  ${CORE_CHART_FIELDS}
  query getCharts($hubName: String!, $projectID: String!) {
    getCharts(hubName: $hubName, projectID: $projectID) {
      ...CoreChartFields
    }
  }
`;

export const GET_EXPERIMENT_DATA = gql`
  ${CORE_CHART_FIELDS}
  query getExperiment($data: ExperimentInput!) {
    getHubExperiment(experimentInput: $data) {
      ...CoreChartFields
    }
  }
`;

export const GET_HUB_STATUS = gql`
  query getHubStatus($data: String!) {
    getHubStatus(projectID: $data) {
      id
      HubName
      RepoBranch
      RepoURL
      TotalExp
      IsAvailable
      AuthType
      IsPrivate
      Token
      UserName
      Password
      SSHPrivateKey
      SSHPublicKey
      LastSyncedAt
    }
  }
`;

export const GET_PREDEFINED_EXPERIMENT_YAML = gql`
  query GetPredefinedExperimentYAML($experimentInput: ExperimentInput!) {
    getPredefinedExperimentYAML(experimentInput: $experimentInput)
  }
`;

export const GET_ENGINE_YAML = gql`
  query getEngineData($experimentInput: ExperimentInput!) {
    getYAMLData(experimentInput: $experimentInput)
  }
`;

export const GET_EXPERIMENT_YAML = gql`
  query getExperimentData($experimentInput: ExperimentInput!) {
    getYAMLData(experimentInput: $experimentInput)
  }
`;
