import { AvatarGroup, Button, ButtonVariation, Layout, TableV2, Text } from '@harnessio/uicore';
import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import type { Column, Row } from 'react-table';
import { Icon } from '@harnessio/icons';
import { Classes, Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { useStrings } from '@strings';
import type { Project } from '@api/entities';
import { getFormattedTime, killEvent } from '@utils';
import { PermissionGroup } from '@models';
import css from './AccountSettingsOverview.module.scss';

function MemoizedUserCreatedProjectsTable({ projects }: { projects: Project[] }): React.ReactElement {
  const { getString } = useStrings();

  const columns: Column<Project>[] = React.useMemo(() => {
    return [
      {
        id: 'projectName',
        Header: getString('name'),
        Cell: ({ row: { original: data } }: { row: Row<Project> }) => {
          return (
            <Layout.Horizontal style={{ gap: '0.25rem' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Icon name="main-user-groups" size={20} />
              <Text font={{ variation: FontVariation.BODY }}>{data.name}</Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        id: 'lastModified',
        Header: getString('lastModified'),
        Cell: ({ row: { original: data } }: { row: Row<Project> }) => {
          return (
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {getFormattedTime(parseInt(data.updatedAt))}
            </Text>
          );
        }
      },
      {
        id: 'members',
        Header: 'Members',
        Cell: ({ row: { original: data } }: { row: Row<Project> }) => {
          return (
            <AvatarGroup
              avatars={data.members.map(member => ({
                name: member.userID
              }))}
            />
          );
        }
      },
      {
        id: 'menuItems',
        Header: '',
        Cell: ({ row: { original: data } }: { row: Row<Project> }) => {
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
                  <Menu.Item text={getString('edit')} icon="edit" onClick={() => alert(data.name)} />
                </Menu>
              </Popover>
            </Layout.Vertical>
          );
        }
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <TableV2<Project> className={css.tableMainContainer} columns={columns} data={projects} sortable />;
}

export default function UserCreatedProjects(): React.ReactElement {
  const { getString } = useStrings();

  const projects: Project[] = [
    {
      id: '1',
      name: 'Project 1',
      updatedAt: '1623345600000',
      members: [
        {
          userID: '1',
          role: PermissionGroup.EDITOR,
          joinedAt: '1623345600000',
          invitation: 'accepted'
        }
      ],
      createdAt: '1623345600000',
      state: 'active',
      removedAt: ''
    }
  ];

  return (
    <Layout.Vertical padding={{ top: 'xlarge', bottom: 'xlarge' }}>
      <Text font={{ variation: FontVariation.H5 }}>{getString('projectCreatedByYou')}</Text>
      <MemoizedUserCreatedProjectsTable projects={projects} />
    </Layout.Vertical>
  );
}
