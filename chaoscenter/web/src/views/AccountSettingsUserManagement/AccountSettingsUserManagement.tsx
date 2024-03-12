import { Color, FontVariation } from '@harnessio/design-system';
import {
  Avatar,
  Button,
  ButtonVariation,
  Checkbox,
  Container,
  Layout,
  TableV2,
  Text,
  useToggleOpen
} from '@harnessio/uicore';
import React from 'react';
import type { Column, Row } from 'react-table';
import { Classes, Dialog, Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { Icon } from '@harnessio/icons';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { User, Users } from '@api/auth';
import { getFormattedTime, killEvent } from '@utils';
import Loader from '@components/Loader';
import CreateNewUserController from '@controllers/CreateNewUser';
import ResetPasswordController from '@controllers/ResetPassword';
import EnableDisableUserController from '@controllers/EnableDisableUser';
import css from './AccountSettingsUserManagement.module.scss';

interface AccountSettingsUserManagementViewProps {
  searchInput: JSX.Element;
  usersData: Users;
  useUsersQueryLoading: boolean;
  disabledUserFilter: {
    includeDisabledUsers: boolean;
    setIncludeDisabledUsers: React.Dispatch<React.SetStateAction<boolean>>;
  };
  getUsersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Users, unknown>>;
}

interface MemoizedUsersTableProps {
  users: User[];
  getUsersRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Users, unknown>>;
}

function MemoizedUsersTable({ users, getUsersRefetch }: MemoizedUsersTableProps): React.ReactElement {
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
              <Text font={{ variation: FontVariation.BODY }} lineClamp={1}>
                {data.name ?? getString('NASlash')}
              </Text>
            </Layout.Horizontal>
          );
        }
      },
      {
        id: 'username',
        Header: getString('username'),
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
          return (
            <Text font={{ variation: FontVariation.BODY }} lineClamp={1}>
              {data.username ?? getString('NASlash')}
            </Text>
          );
        }
      },
      {
        id: 'email',
        Header: getString('email'),
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
          return (
            <Text font={{ variation: FontVariation.BODY }} lineClamp={1}>
              {data.email ?? getString('NASlash')}
            </Text>
          );
        }
      },
      {
        id: 'userCreatedOn',
        Header: getString('userCreatedOn'),
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
          return (
            data.createdAt && (
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                {getFormattedTime(data.createdAt)}
              </Text>
            )
          );
        }
      },
      {
        id: 'menuItems',
        Header: '',
        Cell: ({ row: { original: data } }: { row: Row<User> }) => {
          const {
            isOpen: isResetPasswordModalOpen,
            open: openResetPasswordModal,
            close: closeResetPasswordModal
          } = useToggleOpen();
          const {
            isOpen: isEnableDisableModalOpen,
            open: openEnableDisableModal,
            close: closeEnableDisableModal
          } = useToggleOpen();

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
                  <Menu.Item text={getString('resetPassword')} icon="edit" onClick={() => openResetPasswordModal()} />
                  <Menu.Divider />
                  <Menu.Item
                    text={data.isRemoved ? getString('enableUser') : getString('disableUser')}
                    icon={data.isRemoved ? 'unlock' : 'lock'}
                    onClick={() => openEnableDisableModal()}
                  />
                </Menu>
              </Popover>
              {isResetPasswordModalOpen && (
                <Dialog
                  isOpen={isResetPasswordModalOpen}
                  canOutsideClickClose={false}
                  canEscapeKeyClose={false}
                  onClose={() => closeResetPasswordModal()}
                  className={css.nameChangeDialog}
                >
                  <ResetPasswordController username={data.username} handleClose={closeResetPasswordModal} />
                </Dialog>
              )}
              {isEnableDisableModalOpen && (
                <Dialog
                  isOpen={isEnableDisableModalOpen}
                  canOutsideClickClose={false}
                  canEscapeKeyClose={false}
                  onClose={() => closeEnableDisableModal()}
                  className={css.nameChangeDialog}
                >
                  <EnableDisableUserController
                    username={data.username}
                    currentState={data.isRemoved}
                    handleClose={closeEnableDisableModal}
                    getUsersRefetch={getUsersRefetch}
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
  return <TableV2<User> className={css.tableMainContainer} columns={columns} data={users} sortable />;
}

export default function AccountSettingsUserManagementView(
  props: AccountSettingsUserManagementViewProps
): React.ReactElement {
  const { searchInput, usersData, disabledUserFilter, useUsersQueryLoading, getUsersRefetch } = props;
  const { isOpen: isCreateUserModalOpen, open: openCreateUserModal, close: closeCreateUserModal } = useToggleOpen();
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
          <Button
            text={getString('newUser')}
            variation={ButtonVariation.PRIMARY}
            icon="plus"
            onClick={() => openCreateUserModal()}
          />
          <Checkbox
            labelElement={<Text font={{ variation: FontVariation.SMALL }}>{getString('showDisabledUsers')}</Text>}
            checked={disabledUserFilter.includeDisabledUsers}
            onChange={() => disabledUserFilter.setIncludeDisabledUsers(!disabledUserFilter.includeDisabledUsers)}
          />
          {isCreateUserModalOpen && (
            <Dialog
              isOpen={isCreateUserModalOpen}
              canOutsideClickClose={false}
              canEscapeKeyClose={false}
              onClose={() => closeCreateUserModal()}
              className={css.nameChangeDialog}
            >
              <CreateNewUserController getUsersRefetch={getUsersRefetch} handleClose={closeCreateUserModal} />
            </Dialog>
          )}
        </Layout.Horizontal>
        {searchInput}
      </Layout.Horizontal>
      <Layout.Vertical style={{ height: 'calc(100% - 48px)', gap: '0.5rem', overflow: 'scroll' }} padding="medium">
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
          <Container style={{ flexGrow: 1 }}>
            {usersData && <MemoizedUsersTable users={usersData} getUsersRefetch={getUsersRefetch} />}
          </Container>
        </Loader>
      </Layout.Vertical>
    </Layout.Vertical>
  );
}
