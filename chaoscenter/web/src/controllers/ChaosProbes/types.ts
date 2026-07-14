import type { PaginationProps } from '@harnessio/uicore';
import type { Probe } from '@api/entities';
import type { GqlAPIQueryResponse } from '@api/types';
import type { ListProbeRequest, ListProbeResponse } from '@api/core';

export interface ChaosProbesTableProps {
  content: Array<Partial<Probe>>;
  pagination?: PaginationProps;
}

export interface RefetchProbes {
  refetchProbes?: GqlAPIQueryResponse<ListProbeResponse, ListProbeRequest>['refetch'];
}
