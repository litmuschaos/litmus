import React from 'react';
import { useToaster } from '@harnessio/uicore';
import ApiTokensView from '@views/ApiTokens';
import { GetApiTokensResponse, useGetApiTokensQuery } from '@api/auth';
import { getUserDetails } from '@utils';

interface APITokensControllerProps {
  setApiTokensCount: React.Dispatch<React.SetStateAction<number>>;
}

export default function APITokensController(props: APITokensControllerProps): React.ReactElement {
  const { setApiTokensCount } = props;
  const { showError } = useToaster();
  const { accountID } = getUserDetails();
  const [apiTokenData, setApiTokenData] = React.useState<GetApiTokensResponse | undefined>(undefined);

  const { isLoading: apiTokensLoading, refetch: apiTokensRefetch } = useGetApiTokensQuery(
    { user_id: accountID },
    {
      onError: error => {
        showError(error.error);
      },
      onSuccess: data => {
        setApiTokenData(data);
        setApiTokensCount(data.apiTokens.length);
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
