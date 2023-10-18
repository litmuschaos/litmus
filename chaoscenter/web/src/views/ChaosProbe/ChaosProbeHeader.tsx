import React from 'react';
import { Container, Heading, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import type { DefaultLayoutTemplateProps } from '@components/DefaultLayout/DefaultLayout';
import { useStrings } from '@strings';
import { getDetailedTime, getIcon } from '@utils';
import type { ProbeType } from '@api/entities';
import LitmusBreadCrumbs from '@components/LitmusBreadCrumbs';
import MainNav from '@components/MainNav';
import SideNav from '@components/SideNav';
import css from './ChaosProbe.module.scss';

interface ChaosProbeHeaderProps extends DefaultLayoutTemplateProps {
  title: string;
  probeData: {
    name: string;
    description: string;
    type: ProbeType;
  };
  updatedAt: string;
  createdAt: string | undefined;
}

function HeaderToolbar({
  createdAt,
  updatedAt
}: Pick<ChaosProbeHeaderProps, 'createdAt' | 'updatedAt'>): React.ReactElement {
  const { getString } = useStrings();
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-end' }}>
      <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500}>
        <span>{getString('createdOn').toUpperCase()}:</span> {createdAt && getDetailedTime(parseInt(createdAt))}
      </Text>
      <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500}>
        <span>{getString('lastModified').toUpperCase()}:</span> {updatedAt && getDetailedTime(parseInt(updatedAt))}
      </Text>
    </Layout.Vertical>
  );
}

export default function ChaosProbeHeader({
  title,
  probeData,
  updatedAt,
  createdAt,
  breadcrumbs,
  children
}: React.PropsWithChildren<ChaosProbeHeaderProps>): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Layout.Horizontal>
      <Container flex className={css.leftSideBar}>
        <MainNav />
        <SideNav />
      </Container>
      <Container height={'100%'} style={{ flexGrow: 1 }}>
        <Container
          style={{ background: `var(--primary-1)`, maxHeight: '105px' }}
          padding={{ left: 'xlarge', right: 'xlarge', top: 'small', bottom: 'medium' }}
          border={{ bottom: true, color: Color.GREY_200 }}
        >
          <LitmusBreadCrumbs links={breadcrumbs} />
          <Layout.Horizontal margin={{ top: 'medium' }} flex={{ alignItems: 'center' }}>
            {/* Icon, title and description */}
            <Layout.Horizontal spacing={'large'}>
              <Icon size={35} name={getIcon(probeData.type)} />
              <Layout.Vertical padding={{ left: 'small' }}>
                <Layout.Horizontal spacing="xsmall">
                  <Heading
                    style={{ marginTop: '-5px', marginRight: '5px' }}
                    level={4}
                    font={{ variation: FontVariation.H4 }}
                    color={Color.GREY_700}
                  >
                    {title}
                  </Heading>
                  <Text font={{ size: 'small' }}>{`${getString(`id`)}: ${probeData.name}`}</Text>
                </Layout.Horizontal>

                <Layout.Horizontal flex={{ alignItems: 'center' }} className={css.gap4}>
                  <Text font={{ size: 'small' }} color={Color.GREY_700} lineClamp={1}>
                    {probeData.description}
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Horizontal>
            {/* Details of creation, updation and editing */}
            <HeaderToolbar createdAt={createdAt} updatedAt={updatedAt} />
          </Layout.Horizontal>
        </Container>
        {children}
      </Container>
    </Layout.Horizontal>
  );
}
