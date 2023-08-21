import React from 'react';
import { Button, ButtonVariation, Layout, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useStrings } from '@strings';
import type { RemoveInvitationOkResponse, RemoveInvitationMutationProps } from '@api/auth';

interface RemoveMemberViewProps {
  handleClose: () => void;
  userID: string;
  username: string;
  removeMemberMutation: UseMutateFunction<
    RemoveInvitationOkResponse,
    unknown,
    RemoveInvitationMutationProps<never>,
    unknown
  >;
}

export default function RemoveMemberView(props: RemoveMemberViewProps): React.ReactElement {
  const { handleClose, username, removeMemberMutation, userID } = props;
  const { getString } = useStrings();
  const { projectID } = useParams<{ projectID: string }>();
  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('removeMember')}</Text>
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.BODY }}>{getString('removeMemberConfirmation', { username })}</Text>
      <Layout.Horizontal style={{ gap: '1rem' }}>
        <Button
          type="submit"
          variation={ButtonVariation.PRIMARY}
          intent="danger"
          text={getString('confirm')}
          onClick={() =>
            removeMemberMutation(
              {
                body: {
                  projectID: projectID,
                  userID: userID
                }
              },
              {
                onSuccess: () => handleClose()
              }
            )
          }
        />
        <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={() => handleClose()} />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}
