import { Avatar, Button, ButtonVariation, Layout, TableV2, Text, useToggleOpen } from '@harnessio/uicore';
import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import type { Column, Row } from 'react-table';
import { Icon } from '@harnessio/icons';
import { Dialog } from '@blueprintjs/core';
import type { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { PermissionGroup } from '@models';
import type { GetInvitationResponse, GetUserWithProjectOkResponse, ListInvitationsOkResponse } from '@api/auth';
import StatusBadgeV2, { StatusBadgeEntity } from '@components/StatusBadgeV2';
import Loader from '@components/Loader';
import LeaveProjectController from '@controllers/LeaveProject';
import css from './ProjectsJoined.module.scss';

interface ProjectsJoinedViewProps {
  joinedProjects: ListInvitationsOkResponse | undefined;
  useGetUserWithProjectQueryLoading: boolean;
  projectsJoinedRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ListInvitationsOkResponse, unknown>>;
  getUserWithProjectsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetUserWithProjectOkResponse, unknown>>;
}

interface MemoizedProjectsJoinedTableProps
  extends Omit<ProjectsJoinedViewProps, 'joinedProjects' | 'useGetUserWithProjectQueryLoading'> {
  projects: GetInvitationResponse[];
}

function MemoizedProjectsJoinedTable(props: MemoizedProjectsJoinedTableProps): React.ReactElement {
  const { projects, projectsJoinedRefetch, getUserWithProjectsRefetch } = props;
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
        id: 'role',
        Header: getString('role'),
        Cell: ({ row: { original: data } }: { row: Row<GetInvitationResponse> }) => {
          return (
            <StatusBadgeV2
              key={data.projectID}
              entity={StatusBadgeEntity.PermissionGroup}
              status={data.invitationRole as PermissionGroup}
            />
          );
        }
      },
      {
        id: 'invitedBy',
        Header: getString('invitedBy'),
        Cell: ({ row: { original: data } }: { row: Row<GetInvitationResponse> }) => {
          return (
            data.projectOwner && (
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                <Avatar hoverCard={false} name={data.projectOwner.name ?? data.projectOwner.username} />
                <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_700}>
                  {data.projectOwner.name ?? getString('NASlash')}
                </Text>
              </Layout.Horizontal>
            )
          );
        }
      },
      {
        id: 'leaveProject',
        Header: '',
        Cell: ({ row: { original: data } }: { row: Row<GetInvitationResponse> }) => {
          const { isOpen, open, close } = useToggleOpen();
          return (
            <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
              <Button
                key={data.projectID}
                text={
                  <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.RED_600}>
                    {getString('leaveProject')}
                  </Text>
                }
                variation={ButtonVariation.LINK}
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
                  <LeaveProjectController
                    handleClose={close}
                    projectsJoinedRefetch={projectsJoinedRefetch}
                    projectID={data.projectID}
                    getUserWithProjectsRefetch={getUserWithProjectsRefetch}
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
    <TableV2<GetInvitationResponse> className={css.tableMainContainer} columns={columns} data={projects} sortable />
  );
}

export default function ProjectsJoinedView(props: ProjectsJoinedViewProps): React.ReactElement {
  const { joinedProjects, useGetUserWithProjectQueryLoading, projectsJoinedRefetch, getUserWithProjectsRefetch } =
    props;
  const { getString } = useStrings();

  return (
    <Layout.Vertical padding={{ bottom: 'large' }} style={{ minHeight: 200 }}>
      <Text font={{ variation: FontVariation.H5 }}>
        {getString('projectsJoined')} ({joinedProjects?.data?.length ?? 0})
      </Text>
      <Loader
        small
        loading={useGetUserWithProjectQueryLoading}
        noData={{
          when: () => !joinedProjects?.data?.length,
          message: getString('noProjectsJoined')
        }}
      >
        {joinedProjects?.data && (
          <MemoizedProjectsJoinedTable
            projects={joinedProjects.data}
            projectsJoinedRefetch={projectsJoinedRefetch}
            getUserWithProjectsRefetch={getUserWithProjectsRefetch}
          />
        )}
      </Loader>
    </Layout.Vertical>
  );
}
