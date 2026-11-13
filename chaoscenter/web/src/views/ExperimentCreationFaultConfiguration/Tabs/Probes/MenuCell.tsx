/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
import { killEvent } from '@utils';
import type { ProbeObj } from '@api/entities';
import { PermissionGroup, type FaultData } from '@models';
import RbacMenuItem from '@components/RbacMenuItem';
import { removeAttachedProbe } from './probeAttachment';

interface MenuCellProps {
  row: Row<ProbeObj>;
  onEditProbe: (probe: ProbeObj) => void;
  onSave: (data: Omit<FaultData, 'experimentCR'>) => void;
  faultData: FaultData | undefined;
}

export const MenuCell = ({
  row: { original: data },
  onSave,
  onEditProbe,
  faultData
}: MenuCellProps): React.ReactElement => {
  const { getString } = useStrings();
  const { showSuccess } = useToaster();

  const {
    isOpen: isRemoveProbeDialogOpen,
    open: openRemoveProbeDialog,
    close: closeRemoveProbeDialog
  } = useToggleOpen();

  const removeProbeFromManifest = (): void => {
    if (!faultData || !data) return;

    onSave({
      ...faultData,
      probes: removeAttachedProbe(faultData.probes as ProbeObj[] | undefined, data)
    });
    showSuccess(getString('probeDeletedSuccessfully'));
  };

  // <!-- confirmation dialog boxes -->

  const removeProbeDialogProps: ConfirmationDialogProps = {
    isOpen: isRemoveProbeDialogOpen,
    contentText: getString('removeProbeDesc'),
    titleText: getString('removeProbeHeading'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onClose: (isConfirmed: boolean) => {
      if (isConfirmed) {
        removeProbeFromManifest();
      }
      closeRemoveProbeDialog();
    }
  };

  const removeProbeDialog = <ConfirmationDialog {...removeProbeDialogProps} />;

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }} onClick={killEvent}>
      <Popover className={Classes.DARK} position={Position.LEFT}>
        <Button variation={ButtonVariation.ICON} icon="Options" />
        <Menu style={{ backgroundColor: 'unset' }}>
          {/* <!-- edit probe button --> */}
          <ParentComponentErrorWrapper>
            <RbacMenuItem
              icon={'Edit'}
              text={getString('editProbeMode')}
              onClick={() => onEditProbe(data)}
              permission={PermissionGroup.EDITOR}
            />
          </ParentComponentErrorWrapper>
          {/* <!-- delete probe button --> */}
          <ParentComponentErrorWrapper>
            <RbacMenuItem
              icon="main-trash"
              text={getString('remove')}
              onClick={openRemoveProbeDialog}
              permission={PermissionGroup.EDITOR}
            />
          </ParentComponentErrorWrapper>
        </Menu>
      </Popover>
      {removeProbeDialog}
    </Layout.Horizontal>
  );
};
