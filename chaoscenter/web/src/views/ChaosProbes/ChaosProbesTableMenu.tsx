import { Classes, Intent, Menu, Popover, Position } from '@blueprintjs/core';
import {
  Button,
  Layout,
  ButtonVariation,
  useToaster,
  useToggleOpen,
  ConfirmationDialog,
  ConfirmationDialogProps
} from '@harnessio/uicore';
import React from 'react';
import type { Row } from 'react-table';
import { ParentComponentErrorWrapper } from '@errors';
import { useStrings } from '@strings';
import { getScope, killEvent } from '@utils';
import { deleteProbe } from '@api/core';
import type { Probe } from '@api/entities';
import type { RefetchProbes } from '@controllers/ChaosProbes';
import RbacMenuItem from '@components/RbacMenuItem';
import { PermissionGroup } from '@models';
import type { EditProbeData } from './ChaosProbeTable';

interface MenuCellProps extends RefetchProbes {
  row: Row<Probe>;
  setEditProbe: React.Dispatch<React.SetStateAction<EditProbeData | undefined>>;
}

export const MenuCell = ({
  row: { original: data },
  refetchProbes,
  setEditProbe
}: MenuCellProps): React.ReactElement => {
  const scope = getScope();
  const { getString } = useStrings();
  const { showError } = useToaster();

  const {
    isOpen: isOpenDeleteProbeDialog,
    open: openDeleteProbeDialog,
    close: closeDeleteProbeDialog
  } = useToggleOpen();

  const [deleteProbeMutation] = deleteProbe({
    onError: error => showError(error.message),
    onCompleted: () => {
      refetchProbes?.();
    }
  });

  // <!-- confirmation dialog boxes -->

  const deleteProbeDialogProps: ConfirmationDialogProps = {
    isOpen: isOpenDeleteProbeDialog,
    contentText: getString('deleteProbeDesc'),
    titleText: getString('deleteProbeHeading'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onClose: (isConfirmed: boolean) => {
      if (isConfirmed) {
        deleteProbeMutation({ variables: { projectID: scope.projectID, probeName: data.name } });
        refetchProbes?.();
      }
      closeDeleteProbeDialog();
    }
  };

  const deleteProbeDialog = <ConfirmationDialog {...deleteProbeDialogProps} />;

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }} onClick={killEvent}>
      <Popover className={Classes.DARK} position={Position.LEFT}>
        <Button variation={ButtonVariation.ICON} icon="Options" />
        <Menu style={{ backgroundColor: 'unset' }}>
          {/* <!-- edit probe button --> */}
          <ParentComponentErrorWrapper>
            <RbacMenuItem
              icon="Edit"
              text={getString('editProbe')}
              onClick={() => setEditProbe({ name: data.name, infrastructureType: data.infrastructureType })}
              permission={PermissionGroup.EDITOR || PermissionGroup.OWNER}
            />
          </ParentComponentErrorWrapper>
          {/* <!-- delete probe button --> */}
          <ParentComponentErrorWrapper>
            <RbacMenuItem
              icon="main-trash"
              text={getString('deleteProbe')}
              onClick={openDeleteProbeDialog}
              permission={PermissionGroup.EDITOR || PermissionGroup.OWNER}
            />
          </ParentComponentErrorWrapper>
        </Menu>
      </Popover>
      {deleteProbeDialog}
    </Layout.Horizontal>
  );
};
