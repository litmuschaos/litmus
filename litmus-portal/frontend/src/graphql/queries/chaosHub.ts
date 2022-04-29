import { gql } from '@apollo/client';

// getHubStatus
export const CORE_CHART_FIELDS = gql`
  fragment CoreChartFields on Chart {
    apiVersion
    Kind
    metadata {
      name
      version
      annotations {
        categories
        vendor
        createdAt
        repository
        support
        chartDescription
      }
    }
    spec {
      displayName
      categoryDescription
      keywords
      maturity
      experiments
      maintainers {
        name
        email
      }
      minKubeVersion
      provider
      links {
        name
        url
      }
      chaosExpCRDLink
      platforms
      chaosType
    }
    packageInfo {
      packageName
      experiments {
        name
        csv
        desc
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
  query getHubExperiment($request: ExperimentInput!) {
    getHubExperiment(request: $request) {
      ...CoreChartFields
    }
  }
`;

export const GET_HUB_STATUS = gql`
  query getHubStatus($projectID: String!) {
    getHubStatus(projectID: $projectID) {
      id
      hubName
      repoBranch
      repoURL
      totalExp
      isAvailable
      authType
      isPrivate
      token
      userName
      password
      sshPrivateKey
      sshPublicKey
      lastSyncedAt
    }
  }
`;

export const GET_PREDEFINED_EXPERIMENT_YAML = gql`
  query GetPredefinedExperimentYAML($request: ExperimentInput!) {
    getPredefinedExperimentYAML(request: $request)
  }
`;

export const GET_ENGINE_YAML = gql`
  query getEngineData($experimentInput: ExperimentInput!) {
    getYAMLData(experimentInput: $experimentInput)
  }
`;

export const GET_EXPERIMENT_YAML = gql`
  query getYAMLData($request: ExperimentInput!) {
    getYAMLData(request: $request)
  }
`;
