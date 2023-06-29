import { gql, useLazyQuery } from '@apollo/client';
import type { ResourceType } from '@api/entities';
import type { GqlAPILazyQueryRequest, GqlAPILazyQueryResponse } from '@api/types';

export interface CheckResourceIDRequest {
  projectID: string;
  request: {
    resourceName: ResourceType;
    ID: string;
  };
}

export interface CheckResourceIDResponse {
  checkResourceID: boolean;
}

export function checkResourceID({
  ...options
}: GqlAPILazyQueryRequest<CheckResourceIDResponse, CheckResourceIDRequest>): GqlAPILazyQueryResponse<
  CheckResourceIDResponse,
  CheckResourceIDRequest
> {
  // Query to List workflows
  const [checkResourceIDQuery, result] = useLazyQuery<CheckResourceIDResponse, CheckResourceIDRequest>(
    gql`
      query checkResourceID($projectID: ID!, $request: CheckResourceIDRequest!) {
        checkResourceID(projectID: $projectID, request: $request)
      }
    `,
    {
      fetchPolicy: options.fetchPolicy ?? 'cache-and-network',
      ...options
    }
  );

  return [checkResourceIDQuery, result];
}
