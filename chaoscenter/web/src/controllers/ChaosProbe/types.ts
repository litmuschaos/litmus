import { GetProbeRequest, GetProbeResponse } from '@api/core';
import { GqlAPIQueryResponse } from '@api/types';

export interface RefetchGetProbes {
  refetchProbes?: GqlAPIQueryResponse<GetProbeResponse, GetProbeRequest>['refetch'];
}
