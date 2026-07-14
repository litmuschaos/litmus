import React from 'react';
import { Container, Layout, Tabs, useToggleOpen } from '@harnessio/uicore';
import { Dialog, TabId } from '@blueprintjs/core';
import DefaultLayout from '@components/DefaultLayout';
import { useDocumentTitle, useSearchParams, useUpdateSearchParams } from '@hooks';
import { MembersTabs, PermissionGroup } from '@models';
import RbacButton from '@components/RbacButton';
import ActiveProjectMembersController from '@controllers/ActiveProjectMemberList/ActiveProjectMembers';
import InviteUsersController from '@controllers/InviteNewMembers';
import PendingProjectMembersController from '@controllers/PendingProjectMemberList/PendingProjectMembers';
import { useStrings } from '@strings';
import styles from './ProjectMember.module.scss';

export default function ProjectMembersView(): React.ReactElement {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const selectedTabId = searchParams.get('tab') as MembersTabs;
  const { isOpen, close, open } = useToggleOpen();
  const [activeTab, setActiveTab] = React.useState<TabId | undefined>('overview');
  const { getString } = useStrings();

  useDocumentTitle(getString('members'));

  React.useEffect(() => {
    if (!selectedTabId) {
      updateSearchParams({ tab: MembersTabs.ACTIVE });
    } else {
      setActiveTab(selectedTabId);
      updateSearchParams({ tab: selectedTabId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabId]);

  const handleTabChange = (tabID: MembersTabs): void => {
    switch (tabID) {
      case MembersTabs.ACTIVE:
        setActiveTab(tabID);
        updateSearchParams({ tab: MembersTabs.ACTIVE });
        break;
      case MembersTabs.PENDING:
        setActiveTab(tabID);
        updateSearchParams({ tab: MembersTabs.PENDING });
        break;
    }
  };

  return (
    <DefaultLayout breadcrumbs={[]} title={'Members'} noPadding>
      <Container className={styles.tabContainer}>
        <Tabs
          id="projectMembersTabs"
          onChange={handleTabChange}
          selectedTabId={activeTab}
          tabList={[
            {
              id: 'active-members',
              title: getString('activeMembers'),
              panel: (
                <Layout.Vertical height={'100%'}>
                  <Layout.Horizontal
                    flex={{ distribution: 'space-between' }}
                    className={styles.toolbar}
                    padding="medium"
                  >
                    <Layout.Horizontal>
                      <RbacButton
                        intent="primary"
                        data-testid="add-members"
                        icon="plus"
                        iconProps={{ size: 10 }}
                        text={getString('newMember')}
                        permission={PermissionGroup.OWNER}
                        onClick={() => {
                          open();
                        }}
                      />
                    </Layout.Horizontal>
                    {isOpen && (
                      <Dialog
                        isOpen={isOpen}
                        enforceFocus={false}
                        onClose={() => close()}
                        className={styles.modalWithHelpPanel}
                      >
                        <InviteUsersController handleClose={close} />
                      </Dialog>
                    )}
                  </Layout.Horizontal>
                  <ActiveProjectMembersController />
                </Layout.Vertical>
              )
            },
            {
              id: 'pending-members',
              title: getString('pendingMembers'),
              panel: <PendingProjectMembersController />
            }
          ]}
        />
      </Container>
    </DefaultLayout>
  );
}
