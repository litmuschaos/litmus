import React from 'react';
import { ExpandingSearchInput } from '@harnessio/uicore';
import AccountSettingsUserManagementView from '@views/AccountSettingsUserManagement';
import { useStrings } from '@strings';
import { User, useUsersQuery } from '@api/auth';
import { UserType } from '@models';

export default function AccountSettingsUserManagementController(): React.ReactElement {
  const { getString } = useStrings();
  const { data, isLoading, refetch: getUsersRefetch } = useUsersQuery({});

  const [includeDisabledUsers, setIncludeDisabledUsers] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchInput = (
    <ExpandingSearchInput placeholder={getString('search')} alwaysExpanded onChange={value => setSearchQuery(value)} />
  );

  /**
   *
   * @typedef {Object} User
   * @param user The user to check against the filter criteria.
   * @description This filter works on following rules:
   * If the user role is an admin, they will not be shown in the list.
   * If the user is disabled and the includeDisabledUsers flag is false, they will not be shown in the list.
   * If the user's name, username, or email includes the search query, they will be shown in the list.
   * @returns A boolean indicating whether the user should be shown in the list or not.
   */
  function doesFilterCriteriaMatch(user: User): boolean {
    const updatedSearchQuery = searchQuery.trim();
    if (user.role === UserType.ADMIN) return false;
    if (!includeDisabledUsers && user.isRemoved) return false;
    if (
      user.name?.toLowerCase().includes(updatedSearchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(updatedSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(updatedSearchQuery.toLowerCase())
    )
      return true;
    return false;
  }

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    return data.filter(user => doesFilterCriteriaMatch(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, includeDisabledUsers, searchQuery]);

  return (
    <AccountSettingsUserManagementView
      getUsersRefetch={getUsersRefetch}
      searchInput={searchInput}
      usersData={filteredData}
      useUsersQueryLoading={isLoading}
      disabledUserFilter={{
        includeDisabledUsers,
        setIncludeDisabledUsers
      }}
    />
  );
}
