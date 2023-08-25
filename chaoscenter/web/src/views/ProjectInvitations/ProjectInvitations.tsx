import { Avatar, Button, ButtonVariation, Layout, TableV2, Text, useToggleOpen } from '@harnessio/uicore';
import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import type { Column, Row } from 'react-table';
import { Icon } from '@harnessio/icons';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  UseMutateFunction
} from '@tanstack/react-query';
import { Dialog } from '@blueprintjs/core';
import { useStrings } from '@strings';
import type {
  AcceptInvitationMutationProps,
  AcceptInvitationOkResponse,
  GetInvitationResponse,
  GetUserWithProjectOkResponse,
  ListInvitationsOkResponse
} from '@api/auth';
import Loader from '@components/Loader';
import DeleteProjectInvitationController from '@controllers/DeleteProjectInvitation';
import { useAppStore } from '@context';
import css from './ProjectsInvitation.module.scss';

interface ProjectsInvitationsViewProps {
  invitations: ListInvitationsOkResponse | undefined;
  useListInvitationsQueryLoading: boolean;
  listInvitationsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListInvitationsOkResponse, unknown>>;
  acceptInvitationMutation: UseMutateFunction<
    AcceptInvitationOkResponse,
    unknown,
    AcceptInvitationMutationProps<never>,
    unknown
  >;
  projectsJoinedRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListInvitationsOkResponse, unknown>>;
  getUserWithProjectsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetUserWithProjectOkResponse, unknown>>;
}

interface InvitationsTableProps
  extends Omit<ProjectsInvitationsViewProps, 'invitations' | 'useListInvitationsQueryLoading'> {
  invitations: GetInvitationResponse[];
}

function MemoizedInvitationsTable(props: InvitationsTableProps): React.ReactElement {
  const {
    invitations,
    acceptInvitationMutation,
    listInvitationsRefetch,
    projectsJoinedRefetch,
    getUserWithProjectsRefetch
  } = props;
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
          const { open, isOpen, close } = useToggleOpen();
          const { currentUserInfo } = useAppStore();
          return (
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ gap: '0.25rem' }}>
              <Button
                key={data.projectID}
                variation={ButtonVariation.PRIMARY}
                text={getString('acceptInvitation')}
                onClick={() =>
                  acceptInvitationMutation(
                    {
                      body: {
                        projectID: data.projectID ?? '',
                        userID: currentUserInfo?.ID ?? ''
                      }
                    },
                    {
                      onSuccess: () => {
                        listInvitationsRefetch();
                        projectsJoinedRefetch();
                        getUserWithProjectsRefetch();
                      }
                    }
                  )
                }
              />
              <Button
                key={data.projectID}
                icon="main-trash"
                iconProps={{ size: 18, color: Color.RED_300 }}
                variation={ButtonVariation.ICON}
                onClick={() => open()}
              />
              {isOpen && (
                <Dialog
                  isOpen={isOpen}
                  canOutsideClickClose={false}
                  canEscapeKeyClose={false}
                  onClose={() => close()}
                  className={css.nameChangeDialog}
                >
                  <DeleteProjectInvitationController
                    handleClose={close}
                    listInvitationsRefetch={listInvitationsRefetch}
                    projectID={data.projectID}
                  />
                </Dialog>
              )}
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
  const {
    invitations,
    useListInvitationsQueryLoading,
    acceptInvitationMutation,
    listInvitationsRefetch,
    projectsJoinedRefetch,
    getUserWithProjectsRefetch
  } = props;
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
        {invitations?.data && (
          <MemoizedInvitationsTable
            invitations={invitations?.data}
            acceptInvitationMutation={acceptInvitationMutation}
            listInvitationsRefetch={listInvitationsRefetch}
            projectsJoinedRefetch={projectsJoinedRefetch}
            getUserWithProjectsRefetch={getUserWithProjectsRefetch}
          />
        )}
      </Loader>
    </Layout.Vertical>
  );
}
