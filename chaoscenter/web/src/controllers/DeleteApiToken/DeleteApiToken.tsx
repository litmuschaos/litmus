import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import React from 'react';
import { ErrorModel, GetApiTokensResponse, useRemoveApiTokenMutation } from '@api/auth';
import DeleteApiTokenView from '@views/DeleteApiToken';

interface DeleteApiTokenControllerProps {
  token: string | undefined;
  apiTokensRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetApiTokensResponse, ErrorModel>>;
  handleClose: () => void;
}

export default function DeleteApiTokenController(props: DeleteApiTokenControllerProps): React.ReactElement {
  const { token, apiTokensRefetch, handleClose } = props;
  const { mutate: deleteApiTokenMutation, isLoading: deleteApiTokenMutationLoading } = useRemoveApiTokenMutation(
    {},
    {
      onSuccess: () => {
        apiTokensRefetch();
        handleClose();
      }
    }
  );

  return (
    <DeleteApiTokenView
      handleClose={handleClose}
      deleteApiTokenMutation={deleteApiTokenMutation}
      deleteApiTokenMutationLoading={deleteApiTokenMutationLoading}
      token={token}
    />
  );
}
