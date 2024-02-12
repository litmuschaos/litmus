import React from 'react';
import { Dialog, IDialogProps } from '@blueprintjs/core';
import type { RefetchProbes } from '@controllers/ChaosProbes';
import UpdateProbeModalWizardController from '@controllers/UpdateProbeModalWizard';
import type { InfrastructureType } from '@api/entities';
import css from './ChaosProbes.module.scss';

interface UpdateProbeModalProps {
  isOpen: boolean;
  hideDarkModal: () => void;
  probeName: string;
  infrastructureType: InfrastructureType | undefined;
}

export const UpdateProbeModal = ({
  refetchProbes,
  isOpen,
  probeName,
  infrastructureType,
  hideDarkModal
}: RefetchProbes & UpdateProbeModalProps): React.ReactElement => {
  const modalPropsDark: Omit<IDialogProps, 'isOpen'> = {
    isCloseButtonShown: true,
    style: {
      width: 1000,
      height: 620,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden',
      display: 'grid'
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      enforceFocus={false}
      onClose={hideDarkModal}
      {...modalPropsDark}
      className={css.modalWithHelpPanel}
    >
      <UpdateProbeModalWizardController
        hideDarkModal={hideDarkModal}
        refetchProbes={refetchProbes}
        probeName={probeName}
        infrastructureType={infrastructureType}
      />
    </Dialog>
  );
};
