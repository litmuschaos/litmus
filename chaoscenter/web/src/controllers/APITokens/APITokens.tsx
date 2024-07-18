import React from 'react';
import { useToaster } from '@harnessio/uicore';
import ApiTokensView from '@views/ApiTokens';
import { useGetApiTokensQuery } from '@api/auth';
import { getUserDetails } from '@utils';

interface APITokensControllerProps {
  setApiTokensCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function APITokensController(props: APITokensControllerProps): React.ReactElement {
  const { setApiTokensCount } = props;
  const { showError } = useToaster();
  const { accountID } = getUserDetails();

  const {
    data: apiTokenData,
    isLoading: apiTokensLoading,
    refetch: apiTokensRefetch
  } = useGetApiTokensQuery(
    { user_id: accountID },
    {
      onError: error => {
        showError(error.error);
      },
      onSuccess: data => {
        setApiTokensCount(data?.apiTokens?.length ?? 0);
      }
    }
  );

  return (
    <ApiTokensView
      apiTokensData={apiTokenData}
      apiTokensRefetch={apiTokensRefetch}
      getApiTokensQueryLoading={apiTokensLoading}
    />
  );
}
