import React from 'react';
import { Avatar, Button, ButtonVariation, Container, Layout, Text, useToggleOpen } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import { Dialog } from '@blueprintjs/core';
import type { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import MainNav from '@components/MainNav';
import Loader from '@components/Loader';
import { useStrings } from '@strings';
import type { User } from '@api/auth';
import AccountDetailsChangeController from '@controllers/AccountDetailsChange';
import AccountPasswordChangeController from '@controllers/AccountPasswordChange';
import SideNav from '@components/SideNav';
import css from './SettingsWrapper.module.scss';

interface SettingsWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  userAccountDetails: User | undefined;
  userAccountDetailsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<User, unknown>>;
}

export default function SettingsWrapper(props: SettingsWrapperProps): React.ReactElement {
  const { getString } = useStrings();
  const { children, loading, userAccountDetails, userAccountDetailsRefetch } = props;
  const {
    isOpen: isUserDetailsUpdateModalOpen,
    open: openUserDetailsUpdateModal,
    close: closeUserDetailsUpdateModal
  } = useToggleOpen();
  const {
    isOpen: isPasswordChangeModalOpen,
    open: openPasswordChangeModal,
    close: closePasswordChangeModal
  } = useToggleOpen();

  return (
    <Layout.Horizontal width={'100%'} height={'100%'}>
      <Loader loading={loading}>
        <Container flex className={css.leftSideBar}>
          <MainNav />
          <SideNav />
        </Container>
        <Layout.Horizontal style={{ flexGrow: 1 }} height={'100%'}>
          <Container
            width={'20%'}
            style={{ minWidth: 350, position: 'relative' }}
            height={'100%'}
            background={Color.PRIMARY_1}
            padding={{ top: 'xxlarge', right: 'medium', bottom: 'xxlarge', left: 'medium' }}
          >
            <Button
              variation={ButtonVariation.ICON}
              icon="edit"
              className={css.editIcon}
              onClick={() => openUserDetailsUpdateModal()}
            />
            <Layout.Vertical
              style={{ gap: '2rem' }}
              width={'100%'}
              flex={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Layout.Vertical flex={{ alignItems: 'flex-start' }} width={'90%'} spacing={'small'}>
                <Avatar
                  name={userAccountDetails?.name ?? userAccountDetails?.username}
                  size="large"
                  backgroundColor={Color.PRIMARY_7}
                  hoverCard={false}
                />
                <Text font={{ variation: FontVariation.H2 }}>
                  {userAccountDetails?.name ?? userAccountDetails?.username}
                </Text>
              </Layout.Vertical>
              <Layout.Vertical style={{ gap: '1rem' }} width={'90%'}>
                <Text font={{ variation: FontVariation.H5 }}>{getString('basicInformation')}</Text>
                <Layout.Vertical style={{ gap: '0.5rem' }}>
                  <Layout.Horizontal
                    style={{ gap: '0.25rem' }}
                    flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                  >
                    <Icon name="email-inline" size={18} />
                    <Text font={{ variation: FontVariation.BODY }}>{userAccountDetails?.email ?? getString('na')}</Text>
                  </Layout.Horizontal>
                  <Layout.Horizontal
                    style={{ gap: '0.25rem' }}
                    flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                  >
                    <Icon name="lock" size={18} />
                    <Text
                      font={{ variation: FontVariation.BODY }}
                      color={Color.PRIMARY_7}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => openPasswordChangeModal()}
                    >
                      {getString('changePassword')}
                    </Text>
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Layout.Vertical>
            </Layout.Vertical>
          </Container>
          <Container width={'100%'} height={'100%'}>
            {children}
          </Container>
        </Layout.Horizontal>
      </Loader>
      {isUserDetailsUpdateModalOpen && (
        <Dialog
          isOpen={isUserDetailsUpdateModalOpen}
          canOutsideClickClose={false}
          canEscapeKeyClose={false}
          onClose={() => closeUserDetailsUpdateModal()}
          className={css.nameChangeDialog}
        >
          <AccountDetailsChangeController
            handleClose={closeUserDetailsUpdateModal}
            currentUser={userAccountDetails}
            userAccountDetailsRefetch={userAccountDetailsRefetch}
          />
        </Dialog>
      )}
      {isPasswordChangeModalOpen && (
        <Dialog
          isOpen={isPasswordChangeModalOpen}
          canOutsideClickClose={false}
          canEscapeKeyClose={false}
          onClose={() => closePasswordChangeModal()}
          className={css.nameChangeDialog}
        >
          <AccountPasswordChangeController
            handleClose={closePasswordChangeModal}
            username={userAccountDetails?.username}
          />
        </Dialog>
      )}
    </Layout.Horizontal>
  );
}
