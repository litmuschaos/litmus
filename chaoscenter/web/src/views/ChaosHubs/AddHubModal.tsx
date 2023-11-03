import React from 'react';
import { Dialog } from '@blueprintjs/core';
import { ButtonVariation, useToggleOpen } from '@harnessio/uicore';
import type { ApolloQueryResult } from '@apollo/client';
import AddHubModalWizardController from '@controllers/AddHubModalWizard';
import type { ListChaosHubRequest, ListChaosHubResponse } from '@api/core';
import { useStrings } from '@strings';
import RbacButton from '@components/RbacButton';
import { PermissionGroup } from '@models';
import css from './ChaosHubs.module.scss';

interface AddHubModalProviderProps {
  listChaosHubRefetch: (
    variables?: Partial<ListChaosHubRequest> | undefined
  ) => Promise<ApolloQueryResult<ListChaosHubResponse>>;
  disabled?: boolean;
}

function AddHubModal({ listChaosHubRefetch, disabled }: AddHubModalProviderProps): React.ReactElement {
  const { getString } = useStrings();
  const { isOpen, open, close } = useToggleOpen();

  return (
    <>
      <RbacButton
        variation={ButtonVariation.PRIMARY}
        text={getString('newChaosHub')}
        icon="plus"
        onClick={() => open()}
        disabled={disabled}
        permission={PermissionGroup.EDITOR}
      />
      {isOpen && (
        <Dialog isOpen={isOpen} enforceFocus={false} onClose={() => close()} className={css.modalWithHelpPanel}>
          <AddHubModalWizardController hideDarkModal={() => close()} listChaosHubRefetch={listChaosHubRefetch} />
        </Dialog>
      )}
    </>
  );
}

export const AddHubModalProvider = ({ listChaosHubRefetch, disabled }: AddHubModalProviderProps): JSX.Element => {
  return <AddHubModal listChaosHubRefetch={listChaosHubRefetch} disabled={disabled} />;
};
