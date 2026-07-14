import type { LazyQueryResult, QueryLazyOptions } from '@apollo/client';
import type { GetProbeResponse, GetProbeRequest, GetProbeYAMLRequest, GetProbeYAMLResponse } from '@api/core';
import type { FaultData } from '@models';

export interface GetProbe {
  getProbeYAMLQuery: (
    options?: QueryLazyOptions<GetProbeYAMLRequest> | undefined
  ) => Promise<LazyQueryResult<GetProbeYAMLResponse, GetProbeYAMLRequest>>;
}

export interface GetLazyProbe {
  getLazyProbeQuery: (
    options?: QueryLazyOptions<GetProbeRequest> | undefined
  ) => Promise<LazyQueryResult<GetProbeResponse, GetProbeRequest>>;
}

export interface FaultProps {
  faultData: FaultData | undefined;
  onSave: (data: Omit<FaultData, 'experimentCR'>) => void;
}
