import { Button, ButtonVariation, Dialog, Layout, Popover, TableV2, Text, useToggleOpen } from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { Classes, Menu, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';
import type { GetProjectMembersOkResponse, ProjectMember } from '@api/auth';
import { killEvent } from '@utils';
import { PermissionGroup } from '@models';
import RbacMenuItem from '@components/RbacMenuItem';
import RemoveMemberController from '@controllers/RemoveMember/RemoveMember';
import Loader from '@components/Loader';
import { MemberEmail, MemberName, MemberPermission } from './ActiveMembersListColumns';
import css from './ProjectMember.module.scss';

interface ActiveMembersTableViewProps {
  activeMembers: ProjectMember[] | undefined;
  isLoading: boolean;
  getMembersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetProjectMembersOkResponse, unknown>>;
}
export default function ActiveMembersTableView({
  activeMembers,
  getMembersRefetch,
  isLoading
}: ActiveMembersTableViewProps): React.ReactElement {
  const { getString } = useStrings();
  const envColumns: Column<ProjectMember>[] = useMemo(
    () => [
      {
        Header: 'MEMBERS',
        id: 'username',
        width: '40%',
        accessor: 'username',
        Cell: MemberName
      },
      {
        Header: 'EMAIL',
        id: 'email',
        accessor: 'email',
        width: '30%',
        Cell: MemberEmail
      },
      {
        Header: 'PERMISSIONS',
        id: 'role',
        accessor: 'role',
        width: '30%',
        Cell: MemberPermission
      },
      {
        Header: '',
        id: 'threeDotMenu',
        disableSortBy: true,
        Cell: ({ row: { original: data } }: { row: Row<ProjectMember> }) => {
          const { open: openDeleteModal, isOpen: isDeleteModalOpen, close: hideDeleteModal } = useToggleOpen();
          // const { open: openEditModal, isOpen: isEditOpen, close: hideEditModal } = useToggleOpen();
          if (data.role === 'Owner') return <></>;
          return (
            <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-end' }} onClick={killEvent}>
              <Popover className={Classes.DARK} position={Position.LEFT} interactionKind={PopoverInteractionKind.HOVER}>
                <Button variation={ButtonVariation.ICON} icon="Options" />
                <Menu style={{ backgroundColor: 'unset' }}>
                  {/* <RbacMenuItem icon="edit" text="Edit Role" onClick={openEditModal} permission={PermissionGroup.OWNER} /> */}
                  <RbacMenuItem
                    icon="trash"
                    text={getString('removeMember')}
                    onClick={openDeleteModal}
                    permission={PermissionGroup.OWNER}
                  />
                </Menu>
              </Popover>
              {isDeleteModalOpen && (
                <Dialog
                  isOpen={isDeleteModalOpen}
                  canOutsideClickClose={false}
                  canEscapeKeyClose={false}
                  onClose={() => hideDeleteModal()}
                  className={css.nameChangeDialog}
                >
                  <RemoveMemberController
                    userID={data.userID}
                    username={data.username}
                    hideDeleteModal={hideDeleteModal}
                    getMembersRefetch={getMembersRefetch}
                  />
                </Dialog>
              )}
            </Layout.Vertical>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <Layout.Vertical height={'100%'} padding="medium">
      <Text font={{ variation: FontVariation.H6 }}>Total Members: {activeMembers?.length ?? 0}</Text>
      <Loader
        loading={isLoading}
        noData={{
          when: () => activeMembers?.length === 0,
          messageTitle: getString('membersNotAvailableTitle'),
          message: getString('membersNotAvailableMessage')
        }}
      >
        {activeMembers && <TableV2<ProjectMember> columns={envColumns} sortable data={activeMembers} />}
      </Loader>
    </Layout.Vertical>
  );
}
