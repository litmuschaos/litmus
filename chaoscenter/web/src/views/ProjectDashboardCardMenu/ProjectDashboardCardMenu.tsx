import { FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import { Button, ButtonVariation, Layout, Text } from '@harnessio/uicore';
import { UseMutateFunction } from '@tanstack/react-query';
import React from 'react';
import { useStrings } from '@strings';
import { DeleteProjectMutationProps, DeleteProjectOkResponse } from '@api/auth';

interface ProjectDashboardCardMenuViewProps {
  handleClose: () => void;
  projectId: string;
  deleteProjectMutation: UseMutateFunction<
    DeleteProjectOkResponse,
    unknown,
    DeleteProjectMutationProps<never>,
    unknown
  >;
  loading: boolean;
}

export default function ProjectDashboardCardMenuView(props: ProjectDashboardCardMenuViewProps): React.ReactElement {
  const { projectId, deleteProjectMutation, loading, handleClose } = props;
  const { getString } = useStrings();

  return (
    <Layout.Vertical padding="medium" style={{ gap: '1rem' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H4 }}>{getString('deleteProject')}</Text>
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.BODY }}>{getString('deleteProjectWarning')}</Text>
      <Layout.Horizontal style={{ gap: '1rem' }}>
        <Button
          type="submit"
          variation={ButtonVariation.PRIMARY}
          intent={'danger'}
          text={loading ? <Icon name="loading" size={16} /> : getString('confirm')}
          disabled={loading}
          style={{ minWidth: '90px' }}
          onClick={() =>
            deleteProjectMutation({
              project_id: projectId
            })
          }
        />
        <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={handleClose} />
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}
