import React from 'react';
import { ExpandingSearchInput } from '@harnessio/uicore';
import AccountSettingsUserManagementView from '@views/AccountSettingsUserManagement';
import { useStrings } from '@strings';
import { useUsersQuery } from '@api/auth/index.ts';

export default function AccountSettingsUserManagementController(): React.ReactElement {
  const { getString } = useStrings();
  const { data, isLoading, refetch: getUsersRefetch } = useUsersQuery({});

  const [includeDisabledUsers, setIncludeDisabledUsers] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchInput = (
    <ExpandingSearchInput placeholder={getString('search')} alwaysExpanded onChange={value => setSearchQuery(value)} />
  );

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    return data.filter(user => {
      if (!includeDisabledUsers && user.isRemoved) return false;
      if (!searchQuery) return true;
      return (
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
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
