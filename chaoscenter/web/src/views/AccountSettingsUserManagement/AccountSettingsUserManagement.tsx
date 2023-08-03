import { Color, FontVariation } from '@harnessio/design-system';
import { Avatar, Button, ButtonVariation, Checkbox, Container, Layout, TableV2, Text } from '@harnessio/uicore';
import React from 'react';
import type { Column, Row } from 'react-table';
import { Classes, Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { Icon } from '@harnessio/icons';
import { useStrings } from '@strings';
import type { User, Users } from '@api/auth/index.ts';
import { getFormattedTime, killEvent } from '@utils';
import Loader from '@components/Loader';
import css from './AccountSettingsUserManagement.module.scss';

interface AccountSettingsUserManagementViewProps {
  searchInput: JSX.Element;
  usersData: Users;
  useUsersQueryLoading: boolean;
  disabledUserFilter: {
    includeDisabledUsers: boolean;
    setIncludeDisabledUsers: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

function MemoizedUsersTable({ users }: { users: User[] }): React.ReactElement {
  const { getString } = useStrings();
  const columns: Column<User>[] = React.useMemo(() => {
    return [
      {
        id: 'status',
        Header: '',
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
          return (
            <Icon
              className={css.status}
              name="full-circle"
              size={10}
              width={30}
              color={!data.isRemoved ? Color.GREEN_500 : Color.RED_500}
            />
          );
        }
      },
      {
        id: 'name',
        Header: getString('name'),
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
          return (
            <Layout.Horizontal style={{ gap: '0.25rem' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Avatar name={data.name} hoverCard={false} />
              <Text font={{ variation: FontVariation.BODY }}>{data.name ?? getString('NASlash')}</Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        id: 'username',
        Header: getString('username'),
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
          return <Text font={{ variation: FontVariation.BODY }}>{data.username ?? getString('NASlash')}</Text>;
        }
      },
      {
        id: 'email',
        Header: getString('email'),
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
          return <Text font={{ variation: FontVariation.BODY }}>{data.email ?? getString('NASlash')}</Text>;
        }
      },
      {
        id: 'userCreatedOn',
        Header: getString('userCreatedOn'),
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
          return (
            data.createdAt && (
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                {getFormattedTime(data.createdAt * 1000)}
              </Text>
            )
          );
        }
      },
      {
        id: 'menuItems',
        Header: '',
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
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
                  <Menu.Item
                    text={getString('edit')}
                    icon="edit"
                    onClick={() => alert(`${data.name} edit modal opens here`)}
                  />
                  <Menu.Divider />
                  <Menu.Item
                    text={getString('resetPassword')}
                    icon="lock"
                    onClick={() => alert(`${data.name} edit modal opens here`)}
                  />
                  <Menu.Divider />
                  <Menu.Item
                    text={data.isRemoved ? getString('enableUser') : getString('disableUser')}
                    icon={data.isRemoved ? 'unlock' : 'lock'}
                    onClick={() => alert(`${data.name} edit modal opens here`)}
                  />
                </Menu>
              </Popover>
            </Layout.Vertical>
          );
        }
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <TableV2<User> className={css.tableMainContainer} columns={columns} data={users} sortable />;
}

export default function AccountSettingsUserManagementView(
  props: AccountSettingsUserManagementViewProps
): React.ReactElement {
  const { searchInput, usersData, disabledUserFilter, useUsersQueryLoading } = props;
  const { getString } = useStrings();

  return (
    <Layout.Vertical height={'100%'}>
      <Layout.Horizontal
        flex={{ justifyContent: 'space-between', alignItems: 'center' }}
        padding={{ top: 'small', bottom: 'small', left: 'medium', right: 'medium' }}
        style={{ gap: '2rem' }}
        background={Color.WHITE}
        className={css.subHeader}
      >
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ gap: '1rem' }}>
          <Button text={'New User'} variation={ButtonVariation.PRIMARY} icon="plus" />
          <Checkbox
            labelElement={<Text font={{ variation: FontVariation.SMALL }}>{getString('showDisabledUsers')}</Text>}
            checked={disabledUserFilter.includeDisabledUsers}
            onChange={() => disabledUserFilter.setIncludeDisabledUsers(!disabledUserFilter.includeDisabledUsers)}
          />
        </Layout.Horizontal>
        {searchInput}
      </Layout.Horizontal>
      <Layout.Vertical style={{ flexGrow: 1, gap: '0.5rem' }} padding="medium">
        <Loader
          small
          loading={useUsersQueryLoading}
          noData={{
            when: () => !usersData?.length,
            message: getString('noUserAddUsers')
          }}
        >
          <Text font={{ variation: FontVariation.H4 }}>
            {getString('totalUsers')}: {usersData?.length ?? 0}
          </Text>
          <Container style={{ flexGrow: 1 }}>{usersData && <MemoizedUsersTable users={usersData} />}</Container>
        </Loader>
      </Layout.Vertical>
    </Layout.Vertical>
  );
}
