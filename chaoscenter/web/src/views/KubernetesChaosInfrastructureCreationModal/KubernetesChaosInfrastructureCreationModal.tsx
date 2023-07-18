import { ButtonVariation, Layout } from '@harnessio/uicore';
import React from 'react';
import { PermissionGroup } from '@models';
import { useStrings } from '@strings';
import { ParentComponentErrorWrapper } from '@errors';
import RbacButton from '@components/RbacButton';
import { KubernetesChaosInfrastructureStepWizardConfiguration } from './KubernetesChaosInfrastructureStepWizardConfiguration';

interface KubernetesChaosInfrastructureCreationModalViewProps {
  startPolling: (pollInterval: number) => void;
  stopPolling: () => void;
}

export default function KubernetesChaosInfrastructureCreationModalView({
  stopPolling,
  startPolling
}: KubernetesChaosInfrastructureCreationModalViewProps): React.ReactElement {
  const { getString } = useStrings();

  const [createInfrastructureModal, setCreateInfrastructureModal] = React.useState<boolean>(false);
  // Close the deployment modal and start polling again
  const kubernetesChaosInfrastructureCreationModalClose = (): void => {
    startPolling(5000);
    setCreateInfrastructureModal(false);
  };

  return (
    <ParentComponentErrorWrapper>
      <>
        {createInfrastructureModal && (
          <Layout.Horizontal style={{ flexGrow: '1' }}>
            <KubernetesChaosInfrastructureStepWizardConfiguration
              kubernetesChaosInfrastructureCreationModalClose={kubernetesChaosInfrastructureCreationModalClose}
              chaosStepWizardIsOpen={createInfrastructureModal}
              setChaosStepWizardIsOpen={setCreateInfrastructureModal}
            />
          </Layout.Horizontal>
        )}
        <RbacButton
          tooltip={'Enable Chaos on your infrastructure'}
          tooltipProps={{
            isDark: true
          }}
          variation={ButtonVariation.PRIMARY}
          text={getString('newChaosInfrastructure')}
          icon="plus"
          onClick={() => {
            // Stop the polling if infrastructure is being created
            stopPolling();
            setCreateInfrastructureModal(true);
          }}
          permission={PermissionGroup.EDITOR}
        />
      </>
    </ParentComponentErrorWrapper>
  );
}
