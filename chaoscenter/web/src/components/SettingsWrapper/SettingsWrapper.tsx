import React from 'react';
import { Avatar, Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import MainNav from '@components/MainNav';
import Loader from '@components/Loader';
import type { User } from '@api/entities';
import { useStrings } from '@strings';
import css from './SettingsWrapper.module.scss';

interface SettingsWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  userAccountDetails: User | undefined;
}

export default function SettingsWrapper(props: SettingsWrapperProps): React.ReactElement {
  const { getString } = useStrings();
  const { children, loading, userAccountDetails } = props;

  return (
    <Layout.Horizontal width={'100%'} height={'100%'}>
      <Loader loading={loading}>
        <Container flex className={css.leftSideBar}>
          <MainNav />
        </Container>
        <Layout.Horizontal style={{ flexGrow: 1 }} height={'100%'}>
          <Container
            width={'30%'}
            style={{ minWidth: 420 }}
            height={'100%'}
            background={Color.PRIMARY_1}
            padding={{ top: 'xxlarge', right: 'medium', bottom: 'xxlarge', left: 'medium' }}
          >
            <Layout.Vertical
              style={{ gap: '2rem' }}
              width={'100%'}
              flex={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Layout.Vertical width={'90%'} spacing={'small'}>
                <Avatar name={userAccountDetails?.name} size="large" backgroundColor={Color.PRIMARY_7} />
                <Text font={{ variation: FontVariation.H2 }}>{userAccountDetails?.name}</Text>
              </Layout.Vertical>
              <Layout.Vertical style={{ gap: '1rem' }} width={'90%'}>
                <Text font={{ variation: FontVariation.H5 }}>{getString('basicInformation')}</Text>
                <Layout.Vertical style={{ gap: '0.5rem' }}>
                  <Layout.Horizontal
                    style={{ gap: '0.25rem' }}
                    flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                  >
                    <Icon name="email-inline" size={18} />
                    <Text font={{ variation: FontVariation.BODY }}>{userAccountDetails?.email}</Text>
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
                      onClick={() => alert('change password')}
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
    </Layout.Horizontal>
  );
}
