import { gql, useMutation } from '@apollo/client';
import type { GqlAPIMutationRequest, GqlAPIMutationResponse } from '@api/types';

export interface GenerateSSHKeyResponse {
  generateSSHKey: {
    publicKey: string;
    privateKey: string;
  };
}

export function generateSSHKey(
  options?: GqlAPIMutationRequest<GenerateSSHKeyResponse, undefined>
): GqlAPIMutationResponse<GenerateSSHKeyResponse, undefined> {
  const [generateSSHKeyMutation, result] = useMutation<GenerateSSHKeyResponse, undefined>(
    gql`
      mutation generateSSHKey {
        generateSSHKey {
          publicKey
          privateKey
        }
      }
    `,
    options
  );

  return [generateSSHKeyMutation, result];
}
