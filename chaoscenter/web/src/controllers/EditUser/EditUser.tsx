import React from 'react';
import type { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import EditUserView from '@views/EditUser';
import { useGetUserQuery, Users, useUpdateDetailsMutation } from '@api/auth/index.ts';

interface EditUserControllerProps {
  handleClose: () => void;
  userID: string | undefined;
  getUsersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Users, unknown>>;
}

export default function EditUserController(props: EditUserControllerProps): React.ReactElement {
  const { handleClose, userID, getUsersRefetch } = props;
  const { data: userData } = useGetUserQuery(
    {
      user_id: userID ?? ''
    },
    {
      enabled: !!userID
    }
  );

  const { mutate: updateDetailsMutation } = useUpdateDetailsMutation(
    {},
    {
      onSuccess: () => getUsersRefetch()
    }
  );

  return <EditUserView handleClose={handleClose} userData={userData} updateDetailsMutation={updateDetailsMutation} />;
}
