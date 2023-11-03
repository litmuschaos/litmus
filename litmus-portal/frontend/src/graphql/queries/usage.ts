import { gql } from '@apollo/client';

// usageQuery
export const GET_GLOBAL_STATS = gql`
  query getGlobalStats($request: UsageDataRequest!) {
    getUsageData(request: $request) {
      totalCount {
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
  query getStats($request: UsageDataRequest!) {
    getUsageData(request: $request) {
      totalCount {
        projects
        agents {
          ns
          total
          cluster
          active
        }
        workflows {
          schedules
          runs
          expRuns
        }
      }
      projects {
        projectID
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
