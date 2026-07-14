import { gql, useLazyQuery } from '@apollo/client';
import type { GqlAPILazyQueryResponse, GqlAPILazyQueryRequest } from '@api/types';

export interface ValidateUniqueProbeRequest {
  projectID: string;
  probeName: string;
}

export interface ValidateUniqueProbeResponse {
  validateUniqueProbe: boolean;
}

export function validateUniqueProbe({
  ...options
}: GqlAPILazyQueryRequest<ValidateUniqueProbeResponse, ValidateUniqueProbeRequest>): GqlAPILazyQueryResponse<
  ValidateUniqueProbeResponse,
  ValidateUniqueProbeRequest
> {
  const [validateUniqueProbeQuery, result] = useLazyQuery<ValidateUniqueProbeResponse, ValidateUniqueProbeRequest>(
    gql`
      query IsProbeUnique($projectID: ID!, $probeName: ID!) {
        validateUniqueProbe(projectID: $projectID, probeName: $probeName)
      }
    `,
    {
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [validateUniqueProbeQuery, result];
}
