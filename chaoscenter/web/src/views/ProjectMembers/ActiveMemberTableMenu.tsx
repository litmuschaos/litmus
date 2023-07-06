import { Classes, Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { Button, Layout, ButtonVariation, Dialog, useToggleOpen } from '@harnessio/uicore';
import React from 'react';
import type { Row } from 'react-table';
import { useStrings } from '@strings';
import { PermissionGroup } from '@models';
import RbacMenuItem from '@components/RbacMenuItem';
import { killEvent } from '@utils';
import type { ProjectMember } from '@controllers/ActiveProjectMembers/types';

export const MenuCell = ({ row: { original: data } }: { row: Row<ProjectMember> }): React.ReactElement => {
  const { getString } = useStrings();

  const { open: openDeleteModal, isOpen: isDeleteModalOpen, close: hideDeleteModal } = useToggleOpen();
  const { open: openEditModal, isOpen: isEditOpen, close: hideEditModal } = useToggleOpen();

  return (
    <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-end' }} onClick={killEvent}>
      <Popover className={Classes.DARK} position={Position.LEFT} interactionKind={PopoverInteractionKind.HOVER}>
        <Button variation={ButtonVariation.ICON} icon="Options" />
        <Menu style={{ backgroundColor: 'unset' }}>
          <RbacMenuItem icon="edit" text="Edit Role" onClick={openEditModal} permission={PermissionGroup.OWNER} />
          <RbacMenuItem
            icon="trash"
            text="Remove Member"
            onClick={openDeleteModal}
            permission={PermissionGroup.OWNER}
          />
        </Menu>
      </Popover>
    </Layout.Vertical>
  );
};
