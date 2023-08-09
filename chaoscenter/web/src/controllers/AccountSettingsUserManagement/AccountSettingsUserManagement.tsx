import React from 'react';
import { ExpandingSearchInput } from '@harnessio/uicore';
import AccountSettingsUserManagementView from '@views/AccountSettingsUserManagement';
import { useStrings } from '@strings';
import { User, useUsersQuery } from '@api/auth/index.ts';
import { UserType } from '@models';

export default function AccountSettingsUserManagementController(): React.ReactElement {
  const { getString } = useStrings();
  const { data, isLoading, refetch: getUsersRefetch } = useUsersQuery({});

  const [includeDisabledUsers, setIncludeDisabledUsers] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchInput = (
    <ExpandingSearchInput placeholder={getString('search')} alwaysExpanded onChange={value => setSearchQuery(value)} />
  );

  function isSearchedValuePresentInUser(user: User): boolean {
    if (
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return true;
    return false;
  }

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    return data.filter(user => {
      if (user.role === UserType.ADMIN) return false;
      if (!includeDisabledUsers && user.isRemoved) return false;
      if (!searchQuery) return true;
      return isSearchedValuePresentInUser(user);
    });
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
