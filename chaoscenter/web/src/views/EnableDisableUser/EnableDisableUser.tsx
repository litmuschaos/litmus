import React from 'react';
import { Button, ButtonVariation, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { FontVariation } from '@harnessio/design-system';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { UpdateStateOkResponse, UpdateStateMutationProps } from '@api/auth';

interface EnableDisableUserViewProps {
  handleClose: () => void;
  currentState: boolean | undefined;
  username: string | undefined;
  updateStateMutation: UseMutateFunction<UpdateStateOkResponse, unknown, UpdateStateMutationProps<never>, unknown>;
  updateStateMutationLoading: boolean;
}

export default function EnableDisableUserView(props: EnableDisableUserViewProps): React.ReactElement {
  const { handleClose, username, currentState, updateStateMutation, updateStateMutationLoading } = props;
  const { getString } = useStrings();

  const handleMutation = () => {
    updateStateMutation(
      {
        body: {
          username: username ?? '',
          isDeactivate: !currentState
        }
      },
      {
        onSuccess: () => {
          handleClose();
        }
      }
    );
  };

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>
          {!currentState ? getString('disableUser') : getString('enableUser')}
        </Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.BODY }}>
        {!currentState ? getString('disableUserDescription') : getString('enableUserDescription')}
      </Text>
      <Layout.Horizontal style={{ gap: '1rem' }}>
        <Button
          type="submit"
          variation={ButtonVariation.PRIMARY}
          intent={!currentState ? 'danger' : 'primary'}
          text={updateStateMutationLoading ? <Icon name="loading" size={16} /> : getString('confirm')}
          disabled={updateStateMutationLoading}
          style={{ minWidth: '90px' }}
          onClick={handleMutation}
        />
        <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={() => handleClose()} />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}
