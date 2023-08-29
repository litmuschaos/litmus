import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { listChaosHub, syncChaosHub } from '@api/core';
import { useStrings } from '@strings';
import { getScope } from '@utils';
import ChaosHubsView from '@views/ChaosHubs';
import type { ChaosHub } from '@api/entities';

export interface LoadingProps {
  listChaosHubLoading: boolean;
  addChaosHubLoading: boolean;
  deleteChaosHubLoading: boolean;
  syncChaosHubLoading: boolean;
}

export default function ChaosHubsController(): React.ReactElement {
  const scope = getScope();
  const { getString } = useStrings();
  const { showSuccess, showError } = useToaster();
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const {
    data,
    loading: listChaosHubLoading,
    refetch
  } = listChaosHub({
    ...scope,
    filter: {
      chaosHubName: searchTerm
    },
    options: {
      onError: err => showError(err.message)
    }
  });

  const [syncChaosHubMutation, { loading: syncChaosHubMutationLoading }] = syncChaosHub({
    onCompleted: () => {
      showSuccess(getString('syncedSuccessfully'));
      refetch();
    },
    onError: (error: { message: React.SetStateAction<string | undefined> }) => {
      showError(error.message);
    }
  });

  function listHub(): ChaosHub[] | undefined {
    if (data && data.listChaosHub && searchTerm !== '') {
      if (!data.listChaosHub[0].name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())) {
        return data.listChaosHub.slice(1);
      }
    }
    return data?.listChaosHub;
  }

  return (
    <ChaosHubsView
      chaosHubs={listHub()}
      syncChaosHubMutation={syncChaosHubMutation}
      loading={{
        listChaosHub: listChaosHubLoading,
        syncChaosHub: syncChaosHubMutationLoading
      }}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      listChaosHubRefetch={refetch}
    />
  );
}
