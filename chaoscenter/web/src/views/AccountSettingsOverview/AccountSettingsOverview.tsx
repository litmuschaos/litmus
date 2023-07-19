import { Card, Container, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import { useStrings } from '@strings';
import UserCreatedProjects from './UserCreatedProjects';
import css from './AccountSettingsOverview.module.scss';

export default function AccountSettingsOverviewView(): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Layout.Vertical padding={'medium'}>
      <Container border={{ bottom: true }}>
        <Text font={{ variation: FontVariation.H3 }}>{getString('overview')}</Text>
        <Card className={css.overviewCard}>
          <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }} style={{ gap: '2rem' }}>
            <Layout.Horizontal style={{ gap: '0.5rem' }} flex={{ alignItems: 'center' }}>
              <Icon name="nav-project" size={40} color={Color.GREY_800} />
              <Layout.Horizontal flex={{ alignItems: 'flex-end' }} style={{ gap: '0.25rem' }}>
                <Text font={{ variation: FontVariation.H1 }} color={Color.PRIMARY_7} style={{ lineHeight: 1 }}>
                  {20}
                </Text>
                <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                  {getString('projectsInTotal')}
                </Text>
              </Layout.Horizontal>
            </Layout.Horizontal>
            <Layout.Vertical style={{ gap: '0.5rem' }}>
              <Layout.Horizontal
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                style={{ gap: '0.25rem' }}
              >
                <Text font={{ variation: FontVariation.H4 }} style={{ lineHeight: 1 }}>
                  1
                </Text>
                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} style={{ lineHeight: 1 }}>
                  {getString('projectCreatedByYou')}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                style={{ gap: '0.25rem' }}
              >
                <Text font={{ variation: FontVariation.H4 }} style={{ lineHeight: 1 }}>
                  4
                </Text>
                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} style={{ lineHeight: 1 }}>
                  {getString('projectsByInvite')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Horizontal>
              <Text
                font={{ variation: FontVariation.BODY }}
                color={Color.PRIMARY_7}
                style={{ userSelect: 'none', cursor: 'pointer' }}
                onClick={() => alert('View Invitations')}
              >
                {getString('viewInvitations')}
              </Text>
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Card>
      </Container>
      <UserCreatedProjects />
    </Layout.Vertical>
  );
}
