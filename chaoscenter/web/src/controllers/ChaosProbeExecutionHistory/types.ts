import type { Mode, Status, UserDetails } from '@api/entities';
import type { GqlAPIQueryResponse } from '@api/types';
import type { GetProbeReferenceRequest, GetProbeReferenceResponse } from '@api/core';

export interface RecentExecutions {
  experimentName: string;
  experimentID: string;
  status: Status | undefined;
  updatedAt: number;
  updatedBy: UserDetails;
}
export interface ReferenceTableProps {
  totalRuns: number;
  faultName: string;
  executionHistory: Array<RecentExecutions>;
  mode: Mode;
}

export interface ChaosProbesExecutionHistoryTableProps {
  content: Array<ReferenceTableProps>;
  // pagination?: PaginationProps; TODO: support to be added
}

export interface RefetchProbeReference {
  refetchProbeReference: GqlAPIQueryResponse<GetProbeReferenceResponse, GetProbeReferenceRequest>['refetch'];
}
