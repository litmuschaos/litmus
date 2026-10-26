import React from 'react';
import { useParams } from 'react-router-dom';
import { ExpandingSearchInput } from '@harnessio/uicore';
import { useStrings } from '@strings';
import { useGetUsersForInvitationQuery, User } from '@api/auth';
import InviteNewMembersView from '@views/InviteNewMembers/InviteNewMembers';
import type { ProjectPathParams } from '@routes/RouteInterfaces';

interface InviteUsersControllerProps {
  handleClose: () => void;
}

export default function InviteUsersController({ handleClose }: InviteUsersControllerProps): React.ReactElement {
  const { projectID } = useParams<ProjectPathParams>();
  const { data, isLoading, refetch: getUsers } = useGetUsersForInvitationQuery({ project_id: projectID });
  const { getString } = useStrings();

  const [searchQuery, setSearchQuery] = React.useState('');
  const searchInput = (
    <ExpandingSearchInput placeholder={getString('search')} alwaysExpanded onChange={value => setSearchQuery(value)} />
  );

  function doesFilterCriteriaMatch(user: User): boolean {
    const updatedSearchQuery = searchQuery.trim();
    if (
      user.name?.toLowerCase().includes(updatedSearchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(updatedSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(updatedSearchQuery.toLowerCase())
    )
      return true;
    return false;
  }

  const filteredData = React.useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(user => doesFilterCriteriaMatch(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchQuery]);

  return (
    <InviteNewMembersView
      data={filteredData}
      getUsers={getUsers}
      handleClose={handleClose}
      isLoading={isLoading}
      searchInput={searchInput}
    />
  );
}
