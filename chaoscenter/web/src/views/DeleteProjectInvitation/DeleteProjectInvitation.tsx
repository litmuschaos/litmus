import type { UseMutateFunction } from '@tanstack/react-query';
import React from 'react';
import { Button, ButtonVariation, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { FontVariation } from '@harnessio/design-system';
import type { DeclineInvitationOkResponse, DeclineInvitationMutationProps } from '@api/auth';
import { useStrings } from '@strings';
import { useAppStore } from '@context';

interface DeleteProjectInvitationViewProps {
  declineInvitationMutation: UseMutateFunction<
    DeclineInvitationOkResponse,
    unknown,
    DeclineInvitationMutationProps<never>,
    unknown
  >;
  handleClose: () => void;
  projectID: string | undefined;
}

export default function DeleteProjectInvitationView(props: DeleteProjectInvitationViewProps): React.ReactElement {
  const { declineInvitationMutation, handleClose, projectID } = props;
  const { getString } = useStrings();
  const { currentUserInfo } = useAppStore();

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('declineInvitation')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.BODY }}>{getString('declineInvitationDescription')}</Text>
      <Layout.Horizontal style={{ gap: '1rem' }}>
        <Button
          type="submit"
          variation={ButtonVariation.PRIMARY}
          intent="danger"
          text={getString('confirm')}
          onClick={() =>
            declineInvitationMutation({
              body: {
                projectID: projectID ?? '',
                userID: currentUserInfo?.ID ?? ''
              }
            })
          }
        />
        <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={() => handleClose()} />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}
