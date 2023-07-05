import React from 'react';
import { useToaster } from '@harnessio/uicore';
import type { ApolloQueryResult, MutationFunction } from '@apollo/client';
import {
  deleteChaosHub,
  ListChaosHubRequest,
  ListChaosHubResponse,
  SyncChaosHubRequest,
  SyncChaosHubResponse
} from '@api/core';
import { ChaosHubMenuView } from '@views/ChaosHubMenu/ChaosHubMenu';
import type { ChaosHub } from '@api/entities';
import { useStrings } from '@strings';

interface ChaosHubMenuControllerProps {
  chaosHub: ChaosHub;
  hubID: React.MutableRefObject<string | null>;
  syncChaosHubMutation: MutationFunction<SyncChaosHubResponse, SyncChaosHubRequest>;
  listChaosHubRefetch: (
    variables?: Partial<ListChaosHubRequest> | undefined
  ) => Promise<ApolloQueryResult<ListChaosHubResponse>>;
  loading: {
    syncChaosHub: boolean;
  };
  isDefault: boolean;
}

export default function ChaosHubMenuController({
  listChaosHubRefetch,
  syncChaosHubMutation,
  chaosHub,
  isDefault,
  loading,
  hubID
}: ChaosHubMenuControllerProps): React.ReactElement {
  const { getString } = useStrings();
  const { showSuccess, showError } = useToaster();

  const [deleteChaosHubMutation, { loading: deleteChaosHubMutationLoading }] = deleteChaosHub({
    onCompleted: () => {
      showSuccess(getString('hubDeletedSuccessfully'));
      listChaosHubRefetch();
    },
    onError: err => showError(err.message)
  });

  return (
    <ChaosHubMenuView
      chaosHub={chaosHub}
      hubID={hubID}
      isDefault={isDefault}
      deleteChaosHubMutation={deleteChaosHubMutation}
      syncChaosHubMutation={syncChaosHubMutation}
      loading={{
        deleteChaosHub: deleteChaosHubMutationLoading,
        syncChaosHub: loading.syncChaosHub
      }}
      listChaosHubRefetch={listChaosHubRefetch}
    />
  );
}
