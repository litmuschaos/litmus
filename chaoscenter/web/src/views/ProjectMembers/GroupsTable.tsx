import { Button, ButtonVariation, Dialog, Layout, Popover, TableV2, Text, useToggleOpen } from '@harnessio/uicore';
import React, { useMemo } from 'react';
import type { Column, Row } from 'react-table';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { Classes, Menu, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { Color, FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';
import type { GetProjectGroupsOkResponse, GroupMember } from '@api/auth';
import { killEvent } from '@utils';
import { PermissionGroup } from '@models';
import RbacMenuItem from '@components/RbacMenuItem';
import Loader from '@components/Loader';
import RemoveGroupController from '@controllers/RemoveGroup/RemoveGroup';
import css from './ProjectMember.module.scss';

interface GroupsTableViewProps {
  groups: GroupMember[] | undefined;
  isLoading: boolean;
  getGroupsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetProjectGroupsOkResponse, unknown>>;
}

export default function GroupsTableView({
  groups,
  getGroupsRefetch,
  isLoading
}: GroupsTableViewProps): React.ReactElement {
  const { getString } = useStrings();

  const columns: Column<GroupMember>[] = useMemo(
    () => [
      {
        Header: getString('groupName').toUpperCase(),
        id: 'group',
        width: '40%',
        accessor: 'group',
        Cell: ({ row: { original: data } }: { row: Row<GroupMember> }) => (
          <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }} color={Color.BLACK}>
            {data.group}
          </Text>
        )
      },
      {
        Header: getString('groupRole').toUpperCase(),
        id: 'role',
        accessor: 'role',
        width: '30%',
        Cell: ({ row: { original: data } }: { row: Row<GroupMember> }) => (
          <Text font={{ variation: FontVariation.BODY }} color={Color.BLACK}>
            {data.role}
          </Text>
        )
      },
      {
        Header: getString('assignedAt').toUpperCase(),
        id: 'assignedAt',
        accessor: 'assignedAt',
        width: '20%',
        Cell: ({ row: { original: data } }: { row: Row<GroupMember> }) => (
          <Text font={{ variation: FontVariation.BODY }} color={Color.BLACK}>
            {new Date(data.assignedAt).toLocaleDateString()}
          </Text>
        )
      },
      {
        Header: '',
        id: 'threeDotMenu',
        disableSortBy: true,
        Cell: ({ row: { original: data } }: { row: Row<GroupMember> }) => {
          const { open: openDeleteModal, isOpen: isDeleteModalOpen, close: hideDeleteModal } = useToggleOpen();
          return (
            <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-end' }} onClick={killEvent}>
              <Popover className={Classes.DARK} position={Position.LEFT} interactionKind={PopoverInteractionKind.HOVER}>
                <Button variation={ButtonVariation.ICON} icon="Options" />
                <Menu style={{ backgroundColor: 'unset' }}>
                  <RbacMenuItem
                    icon="trash"
                    text={getString('removeGroup')}
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
                  <RemoveGroupController
                    groupName={data.group}
                    hideDeleteModal={hideDeleteModal}
                    getGroupsRefetch={getGroupsRefetch}
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
      <Text font={{ variation: FontVariation.H6 }}>
        {getString('groupMembers')}: {groups?.length ?? 0}
      </Text>
      <Loader
        loading={isLoading}
        noData={{
          when: () => groups?.length === 0,
          messageTitle: getString('noGroupsTitle'),
          message: getString('noGroupsMessage')
        }}
      >
        {groups && <TableV2<GroupMember> columns={columns} sortable data={groups} />}
      </Loader>
    </Layout.Vertical>
  );
}
