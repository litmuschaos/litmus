import React from 'react';
import { Button, ButtonVariation, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { FontVariation } from '@harnessio/design-system';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useStrings } from '@strings';
import { useAppStore } from '@context';
import type { LeaveProjectOkResponse, LeaveProjectMutationProps } from '@api/auth';

interface LeaveProjectViewProps {
  handleClose: () => void;
  leaveProjectMutation: UseMutateFunction<LeaveProjectOkResponse, unknown, LeaveProjectMutationProps<never>, unknown>;
  projectID: string | undefined;
}

export default function LeaveProjectView(props: LeaveProjectViewProps): React.ReactElement {
  const { handleClose, leaveProjectMutation, projectID } = props;
  const { getString } = useStrings();
  const { currentUserInfo } = useAppStore();

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('leaveProject')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.BODY }}>{getString('leaveProjectDescription')}</Text>
      <Layout.Horizontal style={{ gap: '1rem' }}>
        <Button
          type="submit"
          variation={ButtonVariation.PRIMARY}
          intent="danger"
          text={getString('confirm')}
          onClick={() =>
            leaveProjectMutation({
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
