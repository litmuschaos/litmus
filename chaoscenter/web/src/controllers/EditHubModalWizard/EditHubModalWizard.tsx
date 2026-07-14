import React from 'react';
import { useToaster } from '@harnessio/uicore';
import type { ApolloQueryResult } from '@apollo/client';
import EditHubModalWizardView from '@views/EditHubModalWizard';
import type { ChaosHub } from '@api/entities';
import { updateChaosHub } from '@api/core';
import type { ListChaosHubRequest, ListChaosHubResponse } from '@api/core';

interface EditHubModalWizardControllerProps {
  hideDarkModal: () => void;
  listChaosHubRefetch: (
    variables?: Partial<ListChaosHubRequest> | undefined
  ) => Promise<ApolloQueryResult<ListChaosHubResponse>>;
  chaosHubDetails: ChaosHub | undefined;
}

export default function EditHubModalWizardController({
  hideDarkModal,
  listChaosHubRefetch,
  chaosHubDetails
}: EditHubModalWizardControllerProps): React.ReactElement {
  const { showError } = useToaster();
  const [updateChaosHubMutation, { loading: updateChaosHubMutationLoading, error: updateHubMutationError }] =
    updateChaosHub({
      onCompleted: () => {
        listChaosHubRefetch();
      },
      onError: err => showError(err.message)
    });

  return (
    <EditHubModalWizardView
      hideDarkModal={hideDarkModal}
      hubDetails={chaosHubDetails}
      updateChaosHubMutation={updateChaosHubMutation}
      loading={{ updateChaosHubMutation: updateChaosHubMutationLoading }}
      error={{ updateChaosHubMutation: updateHubMutationError }}
    />
  );
}
