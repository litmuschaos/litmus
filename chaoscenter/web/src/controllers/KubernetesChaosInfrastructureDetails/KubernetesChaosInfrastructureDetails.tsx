import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { deleteKubernetesChaosInfra, listChaosInfra } from '@api/core';
import { useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';
import { getScope } from '@utils';
import KubernetesChaosInfrastructureDetailsView from '@views/KubernetesChaosInfrastructureDetails';

export default function KubernetesChaosInfrastructureDetailsController(): React.ReactElement {
  const { chaosInfrastructureID } = useParams<{ chaosInfrastructureID: string }>();
  const { environmentID } = useParams<{ environmentID: string }>();
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();

  const scope = getScope();
  const { showError, showSuccess } = useToaster();
  const history = useHistory();

  const {
    data,
    loading: listChaosInfrastructureDetailsLoading,
    exists: infraExists,
    refetch
  } = listChaosInfra({
    ...scope,
    filter: {
      name: ''
    },
    infraIDs: [chaosInfrastructureID],
    options: {
      onError: err => {
        showError(err.message);
      }
    }
  });

  const [deleteChaosInfrastructureMutation] = deleteKubernetesChaosInfra({
    onCompleted: () => {
      history.push(paths.toChaosInfrastructures({ environmentID }));
      showSuccess(getString('deleteSuccess'));
      refetch();
    },
    onError: err => showError(err.message)
  });

  const chaosInfrastructureDetails = data && data.listInfras.infras[0];

  return (
    <KubernetesChaosInfrastructureDetailsView
      chaosInfrastructureDetails={chaosInfrastructureDetails}
      chaosInfrastructureID={chaosInfrastructureID}
      deleteChaosInfrastructureMutation={deleteChaosInfrastructureMutation}
      environmentID={environmentID}
      infraExists={infraExists}
      loading={{
        listChaosInfrastructureDetails: listChaosInfrastructureDetailsLoading
      }}
    />
  );
}
