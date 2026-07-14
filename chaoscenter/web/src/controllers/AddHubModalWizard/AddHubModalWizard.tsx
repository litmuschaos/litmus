import React from 'react';
import { useToaster } from '@harnessio/uicore';
import type { ApolloQueryResult } from '@apollo/client';
import AddHubModalWizardView from '@views/AddHubModalWizard';
import { addChaosHub, ListChaosHubRequest, ListChaosHubResponse } from '@api/core';

interface AddHubModalWizardControllerProps {
  hideDarkModal: () => void;
  listChaosHubRefetch: (
    variables?: Partial<ListChaosHubRequest> | undefined
  ) => Promise<ApolloQueryResult<ListChaosHubResponse>>;
}

export default function AddHubModalWizardController({
  hideDarkModal,
  listChaosHubRefetch
}: AddHubModalWizardControllerProps): React.ReactElement {
  const { showError } = useToaster();

  const [addChaosHubMutation, { loading: addChaosHubMutationLoading, error: addHubMutationError }] = addChaosHub({
    onCompleted: () => {
      listChaosHubRefetch();
      hideDarkModal();
    },
    onError: err => showError(err.message)
  });

  return (
    <AddHubModalWizardView
      hideDarkModal={hideDarkModal}
      addChaosHubMutation={addChaosHubMutation}
      loading={{ addChaosHubMutation: addChaosHubMutationLoading }}
      error={{ addChaosHubMutation: addHubMutationError }}
    />
  );
}
