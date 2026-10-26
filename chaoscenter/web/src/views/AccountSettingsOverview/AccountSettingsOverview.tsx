import { Card, Container, Layout, Text } from '@harnessio/uicore';
import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import type { RefetchOptions, RefetchQueryFilters, QueryObserverResult } from '@tanstack/react-query';
import { useStrings } from '@strings';
import type { GetUserWithProjectOkResponse } from '@api/auth';
import AccountSettingsOverviewProjectsController from '@controllers/AccountSettingsOverviewProjects';
import APITokensController from '@controllers/APITokens';
import css from './AccountSettingsOverview.module.scss';

interface AccountSettingsOverviewViewProps {
  userProjectData: GetUserWithProjectOkResponse | undefined;
  projectCount: {
    userCreatedProjects: number | undefined;
    userJoinedProjects: number | undefined;
  };
  getUserWithProjectsRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<GetUserWithProjectOkResponse, unknown>>;
}

export default function AccountSettingsOverviewView(props: AccountSettingsOverviewViewProps): React.ReactElement {
  const { userProjectData, projectCount, getUserWithProjectsRefetch } = props;
  const { getString } = useStrings();
  const [apiTokensCount, setApiTokensCount] = React.useState<number>(0);

  return (
    <Layout.Vertical padding={'medium'} height={'100%'} style={{ overflowY: 'auto' }}>
      <Container border={{ bottom: true }}>
        <Text font={{ variation: FontVariation.H3 }}>{getString('overview')}</Text>
        <Card className={css.overviewCard}>
          <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }} style={{ gap: '2rem' }}>
            <Layout.Horizontal style={{ gap: '0.5rem' }} flex={{ alignItems: 'center' }}>
              <Icon name="nav-project" size={40} color={Color.GREY_800} />
              <Layout.Horizontal flex={{ alignItems: 'flex-end' }} style={{ gap: '0.25rem' }}>
                <Text font={{ variation: FontVariation.H1 }} color={Color.PRIMARY_7} style={{ lineHeight: 1 }}>
                  {userProjectData?.data?.projects?.length ?? 0}
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
                  {apiTokensCount}
                </Text>
                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} style={{ lineHeight: 1 }}>
                  {getString('apiTokens')}
                </Text>
              </Layout.Horizontal>
              <Layout.Horizontal
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                style={{ gap: '0.25rem' }}
              >
                <Text font={{ variation: FontVariation.H4 }} style={{ lineHeight: 1 }}>
                  {projectCount.userCreatedProjects ?? 0}
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
                  {projectCount.userJoinedProjects ?? 0}
                </Text>
                <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} style={{ lineHeight: 1 }}>
                  {getString('projectsByInvite')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Card>
      </Container>
      <APITokensController setApiTokensCount={setApiTokensCount} />
      <AccountSettingsOverviewProjectsController getUserWithProjectsRefetch={getUserWithProjectsRefetch} />
    </Layout.Vertical>
  );
}
