import { Pagination, useToaster } from '@harnessio/uicore';
import React from 'react';
import { useParams } from 'react-router-dom';
import { deleteKubernetesChaosInfra, listChaosInfra } from '@api/core';
import { useStrings } from '@strings';
import { getScope } from '@utils';
import KubernetesChaosInfrastructureView from '@views/KubernetesChaosInfrastructure';
import { getEnvironment } from '@api/core/environments';

export interface LoadingProps {
  listChaosInfrastructureLoading: boolean;
}

export default function KubernetesChaosInfrastructureController(): React.ReactElement {
  const { environmentID } = useParams<{ environmentID: string }>();
  const scope = getScope();
  const { showError, showSuccess } = useToaster();
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const { getString } = useStrings();
  const [page, setPage] = React.useState<number>(0);
  const limit = 5;

  // Fetch the list of all kubernetes chaos infrastructures in the given environment
  const {
    data,
    loading: listChaosInfrastructureLoading,
    error: listChaosInfrastructureError,
    refetch: listInfrastructureRefetch,
    startPolling,
    stopPolling
  } = listChaosInfra({
    ...scope,
    environmentIDs: [`${environmentID}`],
    filter: {
      name: searchTerm
    },
    pagination: {
      limit: limit,
      page: page
    },
    options: {
      pollInterval: 5000,
      onError: err => {
        showError(err.message);
      }
    }
  });

  // Fetch the details of the given environment
  const {
    data: environmentDetails,
    loading: getEnvironmentLoading,
    error: getEnvironmentError
  } = getEnvironment({ projectID: scope.projectID, environmentID: environmentID });

  // Mutation is passed down, will be called on user click event
  const [deleteChaosInfrastructureMutation] = deleteKubernetesChaosInfra({
    onCompleted: () => {
      listInfrastructureRefetch();
      setPage(0);
      showSuccess(getString('deleteSuccess'));
    },
    onError: err => showError(err.message)
  });

  const InfrastructureData = data && data.listInfras.infras ? data.listInfras.infras : [];
  const totalInfrastructures = data?.listInfras.totalNoOfInfras ?? 0;

  const PaginationComponent = (): React.ReactElement => {
    return (
      <Pagination
        itemCount={totalInfrastructures}
        pageSize={limit}
        pageCount={Math.ceil(totalInfrastructures / limit)}
        pageIndex={page}
        gotoPage={pageNumber => setPage(pageNumber)}
      />
    );
  };

  return (
    <KubernetesChaosInfrastructureView
      chaosInfrastructures={InfrastructureData.length <= 0 && searchTerm == '' ? undefined : InfrastructureData}
      loading={{
        listChaosInfrastructure: listChaosInfrastructureLoading,
        getEnvironmentLoading: getEnvironmentLoading
      }}
      error={{
        getEnvironmentError: getEnvironmentError,
        listChaosInfrastructureError: listChaosInfrastructureError
      }}
      refetch={{
        listChaosInfra: listInfrastructureRefetch
      }}
      startPolling={startPolling}
      stopPolling={stopPolling}
      environmentID={environmentID}
      environmentDetails={environmentDetails}
      deleteChaosInfrastructureMutation={deleteChaosInfrastructureMutation}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      totalInfrastructures={totalInfrastructures}
      pagination={<PaginationComponent />}
    />
  );
}
