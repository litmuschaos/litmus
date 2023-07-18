import type { MutationFunction } from '@apollo/client';
import React from 'react';
import { Button, ButtonVariation, Container, Layout, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import { useStrings } from '@strings';
import { getScope } from '@utils';
import { ParentComponentErrorWrapper } from '@errors';
import type { DeleteEnvironmentRequest } from '@api/core/environments';
import { PermissionGroup } from '@models';
import RbacButton from '@components/RbacButton';

interface DeleteEnvironmentViewProps {
  environmentID: string;
  deleteEnvironmentMutation: MutationFunction<string, DeleteEnvironmentRequest>;
  handleClose: () => void;
}

export default function DeleteEnvironmentView({
  environmentID,
  handleClose,
  deleteEnvironmentMutation
}: DeleteEnvironmentViewProps): React.ReactElement {
  const { getString } = useStrings();
  const scope = getScope();

  return (
    <Layout.Vertical padding="small" style={{ gap: '1rem', flexGrow: 1 }}>
      <Container style={{ flexGrow: 1 }}>
        <Text font={{ variation: FontVariation.H4 }}>Delete Environment?</Text>
        <Text font={{ variation: FontVariation.BODY }} margin={{ top: 'small' }}>
          This will delete the Environment.
        </Text>
      </Container>
      <Layout.Horizontal style={{ gap: '0.5rem' }}>
        <ParentComponentErrorWrapper>
          <RbacButton
            text={getString('confirm')}
            variation={ButtonVariation.PRIMARY}
            intent="danger"
            onClick={() =>
              deleteEnvironmentMutation({
                variables: {
                  projectID: scope.projectID,
                  environmentID: environmentID
                }
              }).then(() => {
                handleClose();
              })
            }
            permission={PermissionGroup.EDITOR}
          />
        </ParentComponentErrorWrapper>
        <Button text={getString('cancel')} variation={ButtonVariation.SECONDARY} onClick={handleClose} />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}
