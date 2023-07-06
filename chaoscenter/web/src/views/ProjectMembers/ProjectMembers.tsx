import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import { Container, Layout, Tab, TableV2, Tabs, Text } from '@harnessio/uicore';
import DefaultLayout from '@components/DefaultLayout';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import { MembersTabs, PermissionGroup } from '@models';
import RbacButton from '@components/RbacButton';
import type { ProjectMember } from '@controllers/ActiveProjectMembers/types';
import { useStrings } from '@strings';
import { MemberEmail, MemberName, MemberPermission } from './ActiveMembersListColumns';
import { MenuCell } from './ActiveMemberTableMenu';
import styles from './ProjectMember.module.scss';

export default function ProjectMembersView(): React.ReactElement {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const { getString } = useStrings();
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

  const envColumns: Column<ProjectMember>[] = useMemo(
    () => [
      {
        Header: 'MEMBERS',
        id: 'Username',
        width: '40%',
        accessor: 'Username',
        Cell: MemberName
      },
      {
        Header: 'EMAIL',
        id: 'Email',
        accessor: 'Email',
        width: '30%',
        Cell: MemberEmail
      },
      {
        Header: 'PERMISSIONS',
        id: 'Role',
        width: '30%',
        Cell: MemberPermission
      },
      {
        Header: '',
        id: 'threeDotMenu',
        Cell: ({ row }: { row: Row<ProjectMember> }) => <MenuCell row={{ ...row }} />,
        disableSortBy: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString]
  );
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
                  <TableV2<ProjectMember> columns={envColumns} sortable data={[]} />
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
