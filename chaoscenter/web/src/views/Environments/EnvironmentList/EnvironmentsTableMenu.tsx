import { Classes, Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { Button, Layout, ButtonVariation, Dialog, useToggleOpen } from '@harnessio/uicore';
import React from 'react';
import type { Row } from 'react-table';
import { useStrings } from '@strings';
import { PermissionGroup } from '@models';
import RbacMenuItem from '@components/RbacMenuItem';
import type { EnvironmentDetails, RefetchEnvironments } from '@controllers/Environments/types';
import DeleteEnvironmentController from '@controllers/Environments/DeleteEnvironment';
import EditEnvironmentController from '@controllers/Environments/EditEnvironment';
import { killEvent } from '@utils';
import BlockEnvironmentDeletionView from './BlockEnvironmentDeletion';

export const MenuCell = ({
  row: { original: data, refetchEnvironments }
}: {
  row: Row<EnvironmentDetails> & RefetchEnvironments;
}): React.ReactElement => {
  const { getString } = useStrings();

  const { open: openDeleteModal, isOpen: isDeleteModalOpen, close: hideDeleteModal } = useToggleOpen();
  const { open: openEditModal, isOpen: isEditOpen, close: hideEditModal } = useToggleOpen();

  return (
    <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-end' }} onClick={killEvent}>
      <Popover className={Classes.DARK} position={Position.LEFT} interactionKind={PopoverInteractionKind.HOVER}>
        <Button variation={ButtonVariation.ICON} icon="Options" />
        <Menu style={{ backgroundColor: 'unset' }}>
          <RbacMenuItem
            icon="edit"
            text={getString('editEnvironment')}
            onClick={openEditModal}
            permission={PermissionGroup.EDITOR}
          />
          <RbacMenuItem
            icon="trash"
            text={getString('delete')}
            onClick={openDeleteModal}
            permission={PermissionGroup.EDITOR}
          />
        </Menu>
      </Popover>
      <Dialog isOpen={isDeleteModalOpen} enforceFocus={false} onClose={hideDeleteModal}>
        {data?.infraIds?.length > 0 ? (
          <BlockEnvironmentDeletionView environmentID={data.environmentID} handleClose={hideDeleteModal} />
        ) : (
          <DeleteEnvironmentController
            environmentID={data.environmentID}
            handleClose={hideDeleteModal}
            refetchEnvironments={refetchEnvironments}
          />
        )}
      </Dialog>
      {isEditOpen && (
        <Dialog
          isOpen={isEditOpen}
          canOutsideClickClose={false}
          canEscapeKeyClose={false}
          onClose={() => hideEditModal()}
        >
          <EditEnvironmentController
            handleClose={hideEditModal}
            environmentID={data.environmentID}
            refetchEnvironments={refetchEnvironments}
          />
        </Dialog>
      )}
    </Layout.Vertical>
  );
};
