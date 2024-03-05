import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { getScope } from '@utils';
import { createEnvironment, deleteEnvironment, listEnvironment, updateEnvironment } from '@api/core/environments';
import EnvironmentListView from '@views/Environments/EnvironmentList/EnvironmentsList';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import type { EnvironmentDetailsTableProps } from './types';
import { generateEnvironmentTableContent } from './helper';

const EnvironmentController: React.FC = () => {
  const { showError } = useToaster();
  const scope = getScope();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  // State for pagination
  const page = parseInt(searchParams.get('page') ?? '0');
  const limit = parseInt(searchParams.get('limit') ?? '5');

  const setPage = (newPage: number): void => updateSearchParams({ page: newPage.toString() });
  const setLimit = (newLimit: number): void => updateSearchParams({ limit: newLimit.toString() });
  const {
    data: envData,
    loading: listEnvironmentLoading,
    refetch: refetchEnvironments,
    error: listEnvironmentError
  } = listEnvironment({
    projectID: scope.projectID,
    environmentIDs: [],
    pagination: { page, limit },
    options: {
      onError: err => showError(err.message),
      fetchPolicy: 'cache-first'
    }
  });

  const [deleteEnvironmentMutation] = deleteEnvironment({
    onCompleted: () => {
      refetchEnvironments();
    },
    onError: err => showError(err.message)
  });

  const [createEnvironmentMutation] = createEnvironment({
    onCompleted: () => {
      refetchEnvironments();
    },
    onError: err => showError(err.message)
  });

  const [updateEnvironmentMutation] = updateEnvironment({
    onCompleted: () => {
      refetchEnvironments();
    },
    onError: err => showError(err.message)
  });

  const environments = envData?.listEnvironments.environments;
  const totalEnvironments = envData?.listEnvironments.totalNoOfEnvironments;
  const environmentTableData: EnvironmentDetailsTableProps | undefined = environments && {
    content: generateEnvironmentTableContent(environments),
    pagination: {
      gotoPage: event => setPage(event),
      itemCount: totalEnvironments ?? 0,
      pageCount: totalEnvironments ? Math.ceil(totalEnvironments / limit) : 1,
      pageIndex: page,
      pageSizeOptions: [...new Set([15, 30, limit])].sort(),
      pageSize: limit,
      onPageSizeChange: event => setLimit(event)
    }
  };

  return (
    <EnvironmentListView
      loading={{ listEnvironments: listEnvironmentLoading || listEnvironmentError?.message !== undefined }}
      environmentTableData={environmentTableData}
      refetchEnvironments={refetchEnvironments}
      mutation={{
        createEnvironment: createEnvironmentMutation,
        updateEnvironment: updateEnvironmentMutation,
        deleteEnvironment: deleteEnvironmentMutation
      }}
    />
  );
};

export default EnvironmentController;
