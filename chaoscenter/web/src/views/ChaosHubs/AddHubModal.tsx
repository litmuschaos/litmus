import React from 'react';
import { Dialog } from '@blueprintjs/core';
import { ButtonVariation } from '@harness/uicore';
import type { ApolloQueryResult } from '@apollo/client';
import AddHubModalWizardController from '@controllers/AddHubModalWizard';
import type { ListChaosHubRequest, ListChaosHubResponse } from '@api/core';
import { useStrings } from '@strings';
import { ParentComponentErrorWrapper } from '@errors';
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
  const [isAddChaosHubModalOpen, setIsAddChaosHubModalOpen] = React.useState(false);

  return (
    <>
      <ParentComponentErrorWrapper>
        <RbacButton
          variation={ButtonVariation.PRIMARY}
          text={getString('newChaosHub')}
          icon="plus"
          onClick={() => {
            setIsAddChaosHubModalOpen(true);
          }}
          disabled={disabled}
          permission={PermissionGroup.EDITOR}
        />
      </ParentComponentErrorWrapper>
      <Dialog
        isOpen={isAddChaosHubModalOpen}
        enforceFocus={false}
        onClose={() => setIsAddChaosHubModalOpen(false)}
        className={css.modalWithHelpPanel}
      >
        <AddHubModalWizardController
          hideDarkModal={() => setIsAddChaosHubModalOpen(false)}
          listChaosHubRefetch={listChaosHubRefetch}
        />
      </Dialog>
    </>
  );
}

export const AddHubModalProvider = ({ listChaosHubRefetch, disabled }: AddHubModalProviderProps): JSX.Element => {
  return <AddHubModal listChaosHubRefetch={listChaosHubRefetch} disabled={disabled} />;
};
