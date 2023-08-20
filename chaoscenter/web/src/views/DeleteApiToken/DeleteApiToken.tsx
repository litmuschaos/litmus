import type { UseMutateFunction } from '@tanstack/react-query';
import React from 'react';
import { Button, ButtonVariation, Layout, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import type { RemoveApiTokenMutationProps, RemoveApiTokenOkResponse } from '@api/auth';
import { useStrings } from '@strings';

interface DeleteApiTokenViewProps {
  handleClose: () => void;
  deleteApiTokenMutation: UseMutateFunction<
    RemoveApiTokenOkResponse,
    unknown,
    RemoveApiTokenMutationProps<never>,
    unknown
  >;
  token: string | undefined;
}

export default function DeleteApiTokenView(props: DeleteApiTokenViewProps): React.ReactElement {
  const { handleClose, deleteApiTokenMutation, token } = props;
  const { getString } = useStrings();

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('delete')}</Text>
        <Icon name="cross" style={{ cursor: 'pointer' }} size={18} onClick={() => handleClose()} />
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.BODY }}>{getString('deleteApiTokenDescription')}</Text>
      <Layout.Horizontal style={{ gap: '1rem' }}>
        <Button
          type="submit"
          variation={ButtonVariation.PRIMARY}
          intent="danger"
          text={getString('confirm')}
          onClick={() =>
            deleteApiTokenMutation({
              body: {
                token: token ?? ''
              }
            })
          }
        />
        <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={() => handleClose()} />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}
