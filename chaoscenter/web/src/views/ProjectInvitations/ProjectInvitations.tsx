import { Avatar, Button, ButtonVariation, Layout, TableV2, Text } from '@harnessio/uicore';
import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import type { Column, Row } from 'react-table';
import { Icon } from '@harnessio/icons';
import { useStrings } from '@strings';
import type { GetInvitationResponse, ListInvitationsOkResponse } from '@api/auth/index.ts';
import Loader from '@components/Loader';
import css from './ProjectsInvitation.module.scss';

interface ProjectsInvitationsViewProps {
  invitations: ListInvitationsOkResponse | undefined;
  useListInvitationsQueryLoading: boolean;
}

function MemoizedInvitationsTable({ invitations }: { invitations: GetInvitationResponse[] }): React.ReactElement {
  const { getString } = useStrings();

  const columns: Column<GetInvitationResponse>[] = React.useMemo(() => {
    return [
      {
        id: 'projectName',
        Header: getString('name'),
        Cell: ({ row: { original: data } }: { row: Row<GetInvitationResponse> }) => {
          return (
            <Layout.Horizontal style={{ gap: '0.25rem' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Icon name="nav-project" size={20} />
              <Text font={{ variation: FontVariation.BODY }}>{data.projectName}</Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        id: 'invitedBy',
        Header: getString('invitedBy'),
        Cell: ({ row: { original: data } }: { row: Row<GetInvitationResponse> }) => {
          return (
            data.projectOwner?.name && (
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text font={{ variation: FontVariation.BODY }}>{getString('invitedBy')}</Text>
                <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                  <Avatar hoverCard={false} name={data.projectOwner?.name} />
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
                    {data.projectOwner?.name ?? getString('NASlash')}
                  </Text>
                </Layout.Horizontal>
              </Layout.Horizontal>
            )
          );
        }
      },
      {
        id: 'ctaItems',
        Header: '',
        Cell: ({ row: { original: data } }: { row: Row<GetInvitationResponse> }) => {
          return (
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ gap: '0.25rem' }}>
              <Button key={data.projectID} variation={ButtonVariation.PRIMARY} text={getString('acceptInvitation')} />
              <Button
                key={data.projectID}
                icon="main-trash"
                iconProps={{ size: 18, color: Color.RED_300 }}
                variation={ButtonVariation.ICON}
              />
            </Layout.Horizontal>
          );
        }
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <TableV2<GetInvitationResponse>
      hideHeaders
      className={css.tableMainContainer}
      columns={columns}
      data={invitations}
      sortable
    />
  );
}

export default function ProjectsInvitationsView(props: ProjectsInvitationsViewProps): React.ReactElement {
  const { invitations, useListInvitationsQueryLoading } = props;
  const { getString } = useStrings();

  return (
    <Layout.Vertical padding={{ bottom: 'large' }} style={{ minHeight: 200 }}>
      <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'medium' }}>
        {getString('invitations')} ({invitations?.data?.length ?? 0})
      </Text>
      <Loader
        small
        loading={useListInvitationsQueryLoading}
        noData={{
          when: () => !invitations?.data?.length,
          message: getString('noInvitationsFound')
        }}
      >
        {invitations?.data && <MemoizedInvitationsTable invitations={invitations?.data} />}
      </Loader>
    </Layout.Vertical>
  );
}
