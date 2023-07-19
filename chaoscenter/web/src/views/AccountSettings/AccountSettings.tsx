import React from 'react';
import { Container, Tabs } from '@harnessio/uicore';
import type { TabId } from '@blueprintjs/core';
import { Color } from '@harnessio/design-system';
import cx from 'classnames';
import SettingsWrapper from '@components/SettingsWrapper';
import type { User as GetUserResponse } from '@api/entities';
import { useStrings } from '@strings';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import AccountSettingsOverviewController from '@controllers/AccountSettingsOverview';
import AccountSettingsUserManagementController from '@controllers/AccountSettingsUserManagement';
import css from './AccountSettings.module.scss';

interface AccountSettingsViewProps {
  userAccountDetails: GetUserResponse | undefined;
  loading: {
    getUser: boolean;
  };
}
enum AccountSettingsTabTypes {
  OVERVIEW = 'overview',
  USER_MANAGEMENT = 'user-management'
}

export default function AccountSettingsView(props: AccountSettingsViewProps): React.ReactElement {
  const { getString } = useStrings();
  const updateSearchParams = useUpdateSearchParams();
  const searchParams = useSearchParams();
  const selectedTabId = searchParams.get('tab') as AccountSettingsTabTypes;
  const [activeTab, setActiveTab] = React.useState<TabId | undefined>('overview');
  const { userAccountDetails, loading } = props;

  React.useEffect(() => {
    if (!selectedTabId) {
      updateSearchParams({ tab: AccountSettingsTabTypes.OVERVIEW });
    } else {
      setActiveTab(selectedTabId);
      updateSearchParams({ tab: selectedTabId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabId]);

  const handleTabChange = (tabID: AccountSettingsTabTypes): void => {
    switch (tabID) {
      case AccountSettingsTabTypes.OVERVIEW:
        setActiveTab(tabID);
        updateSearchParams({ tab: AccountSettingsTabTypes.OVERVIEW });
        break;
      case AccountSettingsTabTypes.USER_MANAGEMENT:
        setActiveTab(tabID);
        updateSearchParams({ tab: AccountSettingsTabTypes.USER_MANAGEMENT });
        break;
    }
  };

  return (
    <SettingsWrapper loading={loading.getUser} userAccountDetails={userAccountDetails}>
      <Container
        width={'100%'}
        height={'100%'}
        background={Color.PRIMARY_BG}
        className={cx(
          { [css.tabsContaineUserManagement]: activeTab === AccountSettingsTabTypes.USER_MANAGEMENT },
          css.tabsContainerMain
        )}
      >
        <Tabs
          id={'account-settings-tabs'}
          defaultSelectedTabId={AccountSettingsTabTypes.OVERVIEW}
          onChange={handleTabChange}
          selectedTabId={activeTab}
          tabList={[
            {
              id: 'overview',
              title: getString('overview'),
              panel: <AccountSettingsOverviewController />
            },
            {
              id: 'user-management',
              title: getString('userManagement'),
              panel: <AccountSettingsUserManagementController />
            }
          ]}
        />
      </Container>
    </SettingsWrapper>
  );
}
