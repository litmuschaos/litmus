// interface for environment

import type { PaginationProps } from '@harnessio/uicore';
import type { ListEnvironmentRequest, ListEnvironmentResponse } from '@api/core/environments';
import type { EnvironmentType, UserDetails } from '@api/entities';
import type { GqlAPIQueryResponse } from '@api/types';

export interface EnvironmentDetails {
  environmentID: string;
  name: string;
  tags: string[] | undefined;
  description: string;
  type: EnvironmentType;
  updatedBy: UserDetails | undefined;
  updatedAt: number;
  infraIds: string[];
}

export interface EnvironmentDetailsTableProps {
  content: Array<EnvironmentDetails>;
  pagination?: PaginationProps;
}

export interface RefetchEnvironments {
  refetchEnvironments: GqlAPIQueryResponse<ListEnvironmentResponse, ListEnvironmentRequest>['refetch'];
}
