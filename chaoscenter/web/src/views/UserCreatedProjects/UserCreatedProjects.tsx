import { AvatarGroup, Button, ButtonVariation, Layout, TableV2, Text, useToggleOpen } from '@harnessio/uicore';
import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import type { Column, Row } from 'react-table';
import { Icon } from '@harnessio/icons';
import { Classes, Dialog, Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useStrings } from '@strings';
import { getFormattedTime, killEvent } from '@utils';
import type { GetOwnerProjectsOkResponse, Project } from '@api/auth';
import Loader from '@components/Loader';
import UpdateProjectNameController from '@controllers/UpdateProjectName';
import css from './UserCreatedProjects.module.scss';

interface UserCreatedProjectsViewProps {
  projectData: Project[] | undefined;
  useGetOwnerProjectsQuery: boolean;
  getProjectDataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetOwnerProjectsOkResponse, unknown>>;
}

interface MemoizedUserCreatedProjectsTableProps
  extends Omit<UserCreatedProjectsViewProps, 'projectData' | 'useGetOwnerProjectsQuery'> {
  projects: Project[];
}

function MemoizedUserCreatedProjectsTable({
  projects,
  getProjectDataRefetch
}: MemoizedUserCreatedProjectsTableProps): React.ReactElement {
  const { getString } = useStrings();

  const columns: Column<Project>[] = React.useMemo(() => {
    return [
      {
        id: 'projectName',
        Header: getString('name'),
        Cell: ({ row: { original: data } }: { row: Row<Project> }) => {
          return (
            <Layout.Horizontal style={{ gap: '0.25rem' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Icon name="nav-project" size={20} />
              <Text width="calc(100% - 1.5rem)" lineClamp={1} font={{ variation: FontVariation.BODY }}>
                {data.name}
              </Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        id: 'lastModified',
        Header: getString('lastModified'),
        Cell: ({ row: { original: data } }: { row: Row<Project> }) => {
          return (
            data.updatedAt && (
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                {getFormattedTime(data.updatedAt)}
              </Text>
            )
          );
        }
      },
      {
        id: 'members',
        Header: 'Members',
        Cell: ({ row: { original: data } }: { row: Row<Project> }) => {
          return (
            <AvatarGroup
              avatarGroupProps={{ hoverCard: false }}
              avatars={
                data?.members?.map(member => ({
                  name: member.name
                })) ?? []
              }
              restrictLengthTo={5}
            />
          );
        }
      },
      {
        id: 'menuItems',
        Header: '',
        Cell: ({ row: { original: data } }: { row: Row<Project> }) => {
          const { isOpen, open, close } = useToggleOpen();
          return (
            <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-end' }} onClick={killEvent}>
              <Popover
                className={Classes.DARK}
                position={Position.LEFT}
                interactionKind={PopoverInteractionKind.HOVER}
                usePortal
              >
                <Button variation={ButtonVariation.ICON} icon="Options" />
                <Menu style={{ backgroundColor: 'unset' }}>
                  <Menu.Item text={getString('edit')} icon="edit" onClick={() => open()} />
                </Menu>
              </Popover>
              {isOpen && (
                <Dialog
                  isOpen={isOpen}
                  canOutsideClickClose={false}
                  canEscapeKeyClose={false}
                  onClose={() => close()}
                  className={css.nameChangeDialog}
                >
                  <UpdateProjectNameController
                    projectDetails={{
                      projectID: data.projectID,
                      projectName: data.name
                    }}
                    getProjectDataRefetch={getProjectDataRefetch}
                    handleClose={close}
                  />
                </Dialog>
              )}
            </Layout.Vertical>
          );
        }
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <TableV2<Project> className={css.tableMainContainer} columns={columns} data={projects} sortable />;
}

export default function UserCreatedProjectsView(props: UserCreatedProjectsViewProps): React.ReactElement {
  const { projectData, useGetOwnerProjectsQuery, getProjectDataRefetch } = props;
  const { getString } = useStrings();

  return (
    <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} style={{ minHeight: 200 }}>
      <Text font={{ variation: FontVariation.H5 }}>
        {getString('projectCreatedByYou')} ({projectData?.length ?? 0})
      </Text>
      <Loader
        small
        loading={useGetOwnerProjectsQuery}
        noData={{
          when: () => !projectData?.length,
          message: getString('noProjectsFound')
        }}
      >
        {projectData && (
          <MemoizedUserCreatedProjectsTable projects={projectData} getProjectDataRefetch={getProjectDataRefetch} />
        )}
      </Loader>
    </Layout.Vertical>
  );
}
