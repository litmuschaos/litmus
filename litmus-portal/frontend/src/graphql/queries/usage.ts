import { gql } from '@apollo/client';

// usageQuery
export const GET_GLOBAL_STATS = gql`
  query getGlobalStats($query: UsageQuery!) {
    usageQuery(query: $query) {
      TotalCount {
        projects
        users
        agents {
          ns
          cluster
          total
        }
        workflows {
          schedules
          runs
          expRuns
        }
      }
    }
  }
`;

// projectId -> projectID needs to be updated in backend
export const GLOBAL_PROJECT_DATA = gql`
  query getStats($query: UsageQuery!) {
    usageQuery(query: $query) {
      totalCount {
        projects
      }
      projects {
        projectId
        workflows {
          schedules
          runs
          expRuns
        }
        agents {
          ns
          cluster
          total
        }
      }
    }
  }
`;
