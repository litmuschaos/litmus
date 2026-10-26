import type { PaginationProps } from '@harnessio/uicore';
import type { ExperimentRunStatus, InfrastructureInstallationType, UserDetails } from '@api/entities';
import type {
  ListExperimentRequest,
  ListExperimentResponse,
  ListExperimentRunRequest,
  ListExperimentRunResponse
} from '@api/core';
import type { GqlAPIQueryResponse } from '@api/types';

export interface RecentExecutions {
  experimentRunID: string;
  resilienceScore: number | undefined;
  experimentRunStatus: ExperimentRunStatus;
  executedBy: UserDetails | undefined;
  executedAt: number;
}

export interface ExperimentDetails {
  experimentID: string;
  experimentName: string;
  experimentTags: string[] | undefined;
  cronSyntax: string | boolean;
  experimentManifest: string;
  infrastructure: {
    name: string | undefined;
    type: InfrastructureInstallationType | undefined;
    environmentID: string | undefined;
    infrastructureID: string | undefined;
  };
  recentExecutions: Array<RecentExecutions>;
  updatedBy: UserDetails | undefined;
  updatedAt: number;
  experimentType?: string;
}

export interface ExperimentDashboardTableProps {
  content: Array<ExperimentDetails>;
  pagination?: PaginationProps;
}
export interface RefetchExperiments {
  refetchExperiments: GqlAPIQueryResponse<ListExperimentResponse, ListExperimentRequest>['refetch'];
}

export interface RefetchExperimentRuns {
  refetchExperimentRuns: GqlAPIQueryResponse<ListExperimentRunResponse, ListExperimentRunRequest>['refetch'];
}
