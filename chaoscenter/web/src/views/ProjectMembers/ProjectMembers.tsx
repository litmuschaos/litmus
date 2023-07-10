import React from 'react';
import { Container, Layout, Tab, Tabs, Text } from '@harnessio/uicore';
import DefaultLayout from '@components/DefaultLayout';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import { MembersTabs, PermissionGroup } from '@models';
import RbacButton from '@components/RbacButton';
import ActiveProjectMembersController from '@controllers/ActiveProjectMembers/ActiveProjectMembers';
import styles from './ProjectMember.module.scss';

export default function ProjectMembersView(): React.ReactElement {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const selectedTabId = searchParams.get('tab') as MembersTabs;

  const handleTabChange = (tabID: MembersTabs): void => {
    switch (tabID) {
      case MembersTabs.ACTIVE:
        updateSearchParams({ tab: MembersTabs.ACTIVE });
        break;
      case MembersTabs.PENDING:
        updateSearchParams({ tab: MembersTabs.PENDING });
        break;
    }
  };

  return (
    <DefaultLayout breadcrumbs={[]} title={'Members'} noPadding>
      <Container className={styles.tabContainer}>
        <Tabs id="projectMembersTabs" onChange={handleTabChange} selectedTabId={selectedTabId}>
          <Tab
            id={MembersTabs.ACTIVE}
            panel={
              <Layout.Vertical height={'100%'}>
                <Layout.Horizontal flex={{ distribution: 'space-between' }} className={styles.toolbar} padding="medium">
                  <Layout.Horizontal>
                    <RbacButton
                      intent="primary"
                      data-testid="add-members"
                      icon="plus"
                      iconProps={{ size: 10 }}
                      text="New Member"
                      permission={PermissionGroup.EDITOR}
                      onClick={() => {
                        // setIsModalOpen(true);
                      }}
                    />
                  </Layout.Horizontal>
                </Layout.Horizontal>
                <Layout.Vertical padding="medium">
                  <Text>Total Members</Text>
                  <ActiveProjectMembersController />
                </Layout.Vertical>
              </Layout.Vertical>
            }
            title={MembersTabs.ACTIVE}
          />
          <Tab
            id={MembersTabs.PENDING}
            // disabled={error.BUILDER || !hasFaults}
            panel={<>pending</>}
            title={MembersTabs.PENDING}
          />
        </Tabs>
      </Container>
    </DefaultLayout>
  );
}
