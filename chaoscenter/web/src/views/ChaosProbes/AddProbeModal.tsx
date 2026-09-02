import React from 'react';
import { Dialog, IDialogProps, Intent } from '@blueprintjs/core';
import { Button, ButtonVariation, ConfirmationDialog, ConfirmationDialogProps, useToggleOpen } from '@harnessio/uicore';
import { ParentComponentErrorWrapper } from '@errors';
import type { RefetchProbes } from '@controllers/ChaosProbes';
import { useStrings } from '@strings';
import { InfrastructureType } from '@api/entities';
import AddProbeModalWizardController from '@controllers/AddProbeModalWizard';
import AddProbeInitialTypeContainer from '@views/AddProbeModalWizard/AddProbeInitialTypeContainer';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import css from './ChaosProbes.module.scss';

export const AddProbeModal = ({ refetchProbes }: RefetchProbes): React.ReactElement => {
  const { getString } = useStrings();

  const { open: openDarkModal, isOpen: isProbeSetupWizardOpen, close: hideDarkModal } = useToggleOpen();
  const {
    open: openTuneConfirmationModal,
    isOpen: isProbeTuneConfirmationModalOpen,
    close: hideTuneConfirmationModal
  } = useToggleOpen();
  const { open: openInitialTypeModal, isOpen: isProbeInitWizardOpen, close: hideInitialTypeModal } = useToggleOpen();

  const [infrastructureType, setInfrastructureType] = React.useState<InfrastructureType>(InfrastructureType.KUBERNETES);

  const modalPropsDark: Omit<IDialogProps, 'isOpen'> = {
    isCloseButtonShown: true,
    style: {
      width: 1000,
      minHeight: 600,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden',
      display: 'grid'
    }
  };

  const tuneConfirmationDialogProps: ConfirmationDialogProps = {
    isOpen: isProbeTuneConfirmationModalOpen,
    contentText: getString('discardProbeConfiguration'),
    titleText: getString('confirmText'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    showCloseButton: false,
    onClose: isConfirmed => {
      if (isConfirmed) {
        hideDarkModal();
      }
      hideTuneConfirmationModal();
    }
  };

  return (
    <>
      <Dialog
        isOpen={isProbeSetupWizardOpen}
        enforceFocus={false}
        onClose={hideDarkModal}
        {...modalPropsDark}
        className={css.modalWithHelpPanel}
      >
        <AddProbeModalWizardController
          hideDarkModal={hideDarkModal}
          refetchProbes={refetchProbes}
          infrastructureType={infrastructureType}
        />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => openTuneConfirmationModal()}
          className={css.crossIcon}
        />
      </Dialog>
      <ConfirmationDialog {...tuneConfirmationDialogProps} />
      <Dialog isOpen={isProbeInitWizardOpen} enforceFocus={false} onClose={hideInitialTypeModal} {...modalPropsDark}>
        <AddProbeInitialTypeContainer
          hideInitialTypeModal={hideInitialTypeModal}
          openDarkModal={openDarkModal}
          infrastructureType={infrastructureType}
          setInfrastructureType={setInfrastructureType}
        />
      </Dialog>
      <ParentComponentErrorWrapper>
        <RbacButton
          variation={ButtonVariation.PRIMARY}
          permission={PermissionGroup.EDITOR}
          text={getString(`newProbe`)}
          icon="plus"
          onClick={() => {
            openInitialTypeModal();
          }}
        />
      </ParentComponentErrorWrapper>
    </>
  );
};
