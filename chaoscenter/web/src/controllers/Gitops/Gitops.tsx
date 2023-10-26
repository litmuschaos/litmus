import React from 'react';
import { useToaster } from '@harnessio/uicore';
import GitopsView from '@views/Gitops/Gitops';
import { enableGitOps, getGitOpsDetails, updateGitOps } from '@api/core/gitops';
import { getScope } from '@utils';
import { disableGitOps } from '@api/core/gitops/disableGitops';
import Loader from '@components/Loader';

export default function GitopsController(): React.ReactElement {
  const scope = getScope();
  const { showError, showSuccess } = useToaster();
  const {
    data: getGitOpsDetailsData,
    loading: getGitOpsDetailsLoading,
    refetch: getGitOpsDetailsRefetch
  } = getGitOpsDetails({
    projectID: scope.projectID,
    options: {
      onError: error => showError(error.message),

      nextFetchPolicy: 'cache-first'
    }
  });
  const [enableGitopsMutation, { loading: enableGitopsMutationLoading }] = enableGitOps({
    onCompleted: () => {
      showSuccess('Gitops enabled successfully');
      getGitOpsDetailsRefetch();
    },
    onError: err => showError(err.message)
  });

  const [updateGitopsMutation, { loading: updateGitopsMutationLoading }] = updateGitOps({
    onCompleted: () => {
      showSuccess('Gitops enabled successfully');
      getGitOpsDetailsRefetch();
    },
    onError: err => showError(err.message)
  });

  const [disableGitopsMutation, { loading: disableGitopsMutationLoading }] = disableGitOps({
    onCompleted: () => {
      showSuccess('Gitops disabled successfully');
      getGitOpsDetailsRefetch();
    },
    onError: err => showError(err.message)
  });
  return (
    <Loader
      loading={getGitOpsDetailsLoading}
      height="fit-content"
      style={{
        minHeight: getGitOpsDetailsLoading ? 'calc(var(--page-min-height) - var(--spacing-xxlarge))' : 'initial'
      }}
    >
      <GitopsView
        gitopsDetails={getGitOpsDetailsData?.getGitOpsDetails}
        enableGitops={enableGitopsMutation}
        disableGitops={disableGitopsMutation}
        updateGitops={updateGitopsMutation}
        loading={{
          getGitOpsDetailsLoading: getGitOpsDetailsLoading,
          disableGitopsMutationLoading: disableGitopsMutationLoading,
          updateGitopsMutationLoading: updateGitopsMutationLoading,
          enableGitopsMutationLoading: enableGitopsMutationLoading
        }}
      />
    </Loader>
  );
}
