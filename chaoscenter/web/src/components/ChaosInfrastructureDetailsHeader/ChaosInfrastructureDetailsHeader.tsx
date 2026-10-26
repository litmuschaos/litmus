import React from 'react';
import { Container, Heading, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import type { DefaultLayoutTemplateProps } from '@components/DefaultLayout/DefaultLayout';
import { useStrings } from '@strings';
import { getDetailedTime } from '@utils';
import CopyButton from '@components/CopyButton';
import CustomTagsPopover from '@components/CustomTagsPopover';
import LitmusBreadCrumbs from '@components/LitmusBreadCrumbs';
import MainNav from '@components/MainNav';
import SideNav from '@components/SideNav';
import css from './ChaosInfrastructureDetailsHeader.module.scss';

interface ChaosInfrastructureDetailsHeaderProps extends DefaultLayoutTemplateProps {
  chaosInfrastructureID?: string;
  createdAt?: string;
  tags?: Array<string>;
  description?: string;
}

interface HeaderToolbarProps {
  createdAt?: string;
}

function HeaderToolbar({ createdAt }: HeaderToolbarProps): React.ReactElement {
  const { getString } = useStrings();
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-end' }}>
      <Layout.Horizontal spacing={'xsmall'} flex={{ alignItems: 'center' }}>
        <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500}>
          <span>{getString('createdOn').toUpperCase()}:</span> {createdAt && getDetailedTime(parseInt(createdAt))}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}

export default function ChaosInfrastructureDetailsHeader({
  title,
  chaosInfrastructureID,
  createdAt,
  tags,
  description,
  breadcrumbs,
  children
}: React.PropsWithChildren<ChaosInfrastructureDetailsHeaderProps>): React.ReactElement {
  const { getString } = useStrings();
  const breadCrumb = <LitmusBreadCrumbs links={breadcrumbs} />;

  return (
    <Layout.Horizontal width="100%" height="100vh" flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Container flex className={css.leftSideBar}>
        <MainNav />
        <SideNav />
      </Container>
      <Container style={{ flexGrow: 1 }} height="calc(var(--page-min-height) - 96.53px)">
        <Container
          padding={{ left: 'xlarge', right: 'xlarge', top: 'small', bottom: 'small' }}
          border={{ bottom: true, color: Color.PRIMARY_BG }}
        >
          {breadCrumb}
          <Layout.Horizontal margin={{ top: 'medium' }} flex={{ alignItems: 'center' }}>
            <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
              <Layout.Horizontal flex={{ alignItems: 'baseline' }} spacing="medium">
                <Heading
                  style={{ marginRight: '32px' }}
                  level={4}
                  font={{ variation: FontVariation.H4 }}
                  color={Color.GREY_700}
                >
                  {title ?? <Icon name="steps-spinner" size={22} color={Color.GREY_800} />}
                </Heading>
                {title && (
                  <Layout.Horizontal spacing="small">
                    <Text font={{ variation: FontVariation.SMALL, weight: 'light' }} color={Color.GREY_600}>
                      {getString('idlowerCase')}:
                    </Text>
                    <Text
                      className={css.chaosInfrastructureIdBlock}
                      lineClamp={1}
                      font={{ variation: FontVariation.SMALL, weight: 'light' }}
                    >
                      {chaosInfrastructureID}
                    </Text>
                    <CopyButton stringToCopy={chaosInfrastructureID ?? ''} />
                  </Layout.Horizontal>
                )}
              </Layout.Horizontal>
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} style={{ gap: '1rem' }}>
                <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="small">
                  <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_500}>
                    {getString('description')}:
                  </Text>{' '}
                  <Text
                    font={{ variation: FontVariation.SMALL_SEMI }}
                    color={Color.GREY_500}
                    lineClamp={1}
                    style={{ maxWidth: '150px' }}
                  >
                    {description ? description : getString('na')}
                  </Text>
                </Layout.Horizontal>
                {tags && <CustomTagsPopover tags={tags} />}
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Horizontal margin={{ top: 'medium' }} flex={{ alignItems: 'center' }} spacing={'small'}>
              <HeaderToolbar createdAt={createdAt} />
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Container>
        {children}
      </Container>
    </Layout.Horizontal>
  );
}
