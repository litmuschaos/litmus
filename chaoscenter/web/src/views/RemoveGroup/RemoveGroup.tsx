import React from 'react';
import { Button, ButtonVariation, Layout, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import type { UseMutateFunction } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useStrings } from '@strings';
import type { RemoveGroupFromProjectOkResponse, RemoveGroupFromProjectMutationProps } from '@api/auth';

interface RemoveGroupViewProps {
  handleClose: () => void;
  groupName: string;
  removeGroupMutation: UseMutateFunction<
    RemoveGroupFromProjectOkResponse,
    unknown,
    RemoveGroupFromProjectMutationProps<never>,
    unknown
  >;
}

export default function RemoveGroupView(props: RemoveGroupViewProps): React.ReactElement {
  const { handleClose, groupName, removeGroupMutation } = props;
  const { getString } = useStrings();
  const { projectID } = useParams<{ projectID: string }>();
  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('removeGroup')}</Text>
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.BODY }}>{getString('removeGroupConfirmation')}</Text>
      <Layout.Horizontal style={{ gap: '1rem' }}>
        <Button
          type="submit"
          variation={ButtonVariation.PRIMARY}
          intent="danger"
          text={getString('confirm')}
          onClick={() =>
            removeGroupMutation(
              {
                body: {
                  projectID: projectID,
                  group: groupName
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
