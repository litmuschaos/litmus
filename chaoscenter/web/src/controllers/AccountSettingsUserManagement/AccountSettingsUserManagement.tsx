import React from 'react';
import { ExpandingSearchInput } from '@harnessio/uicore';
import AccountSettingsUserManagementView from '@views/AccountSettingsUserManagement';
import { useStrings } from '@strings';

export default function AccountSettingsUserManagementController(): React.ReactElement {
  const { getString } = useStrings();

  const searchInput = <ExpandingSearchInput placeholder={getString('search')} alwaysExpanded />;

  return <AccountSettingsUserManagementView searchInput={searchInput} />;
}
