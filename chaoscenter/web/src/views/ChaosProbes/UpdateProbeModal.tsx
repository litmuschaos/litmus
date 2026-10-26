import React from 'react';
import { Dialog, IDialogProps } from '@blueprintjs/core';
import UpdateProbeModalWizardController from '@controllers/UpdateProbeModalWizard';
import type { InfrastructureType } from '@api/entities';
import { GqlAPIQueryResponse } from '@api/types';
import { GetProbeRequest, GetProbeResponse } from '@api/core';
import type { RefetchProbes } from '@controllers/ChaosProbes';
import css from './ChaosProbes.module.scss';

interface UpdateProbeModalProps {
  isOpen: boolean;
  hideDarkModal: () => void;
  probeName: string;
  infrastructureType: InfrastructureType | undefined;
  refetchProbes?: GqlAPIQueryResponse<GetProbeResponse, GetProbeRequest>['refetch'] | RefetchProbes['refetchProbes'];
}

export const UpdateProbeModal = ({
  refetchProbes,
  isOpen,
  probeName,
  infrastructureType,
  hideDarkModal
}: UpdateProbeModalProps): React.ReactElement => {
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
