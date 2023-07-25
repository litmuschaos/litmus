import React from 'react';
import GitopsView from '@views/Gitops/Gitops';
import { getGitOpsDetails } from '@api/core/gitops';
import { getScope } from '@utils';
import Loader from '@components/Loader';

const GitopsController: React.FC = () => {
  const scope = getScope();
  const { data: getGitOpsDetailsData, loading: getGitOpsDetailsLoading } = getGitOpsDetails({
    projectID: scope.projectID,
    options: {
      // eslint-disable-next-line no-console
      onError: error => console.error(error.message),
      nextFetchPolicy: 'cache-first'
    }
  });
  return (
    <Loader loading={getGitOpsDetailsLoading}>
      {getGitOpsDetailsData && <GitopsView gitopsDetails={getGitOpsDetailsData} />}
    </Loader>
  );
};

export default GitopsController;
