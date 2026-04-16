import React from 'react';
import { useToaster } from '@harnessio/uicore';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { GetProjectGroupsOkResponse, useRemoveGroupFromProjectMutation } from '@api/auth';
import RemoveGroupView from '@views/RemoveGroup';

interface RemoveGroupControllerProps {
  groupName: string;
  hideDeleteModal: () => void;
  getGroupsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetProjectGroupsOkResponse, unknown>>;
}

export default function RemoveGroupController(props: RemoveGroupControllerProps): React.ReactElement {
  const { groupName, hideDeleteModal, getGroupsRefetch } = props;
  const { showSuccess } = useToaster();

  const { mutate: removeGroupMutation } = useRemoveGroupFromProjectMutation(
    {},
    {
      onSuccess: data => {
        getGroupsRefetch();
        showSuccess(data.message);
      }
    }
  );

  return (
    <RemoveGroupView removeGroupMutation={removeGroupMutation} groupName={groupName} handleClose={hideDeleteModal} />
  );
}
