import React from 'react';
import { Container, Heading, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import cx from 'classnames';
import { defaultTo } from 'lodash-es';
import type { DefaultLayoutTemplateProps } from '@components/DefaultLayout/DefaultLayout';
import { useStrings } from '@strings';
import { getDetailedTime } from '@utils';
import LitmusBreadCrumbs from '@components/LitmusBreadCrumbs';
import { EnvironmentType } from '@api/entities';
import CustomTagsPopover from '@components/CustomTagsPopover';
import MainNav from '@components/MainNav';
import SideNav from '@components/SideNav';
import css from './ChaosInfrastructureHeader.module.scss';

interface ChaosInfrastructureHeaderProps extends DefaultLayoutTemplateProps {
  environmentData: {
    environmentID: string;
    environmentType: EnvironmentType | undefined;
    environmentName: string | undefined;
    environmentDescription: string | undefined;
    environmentTags: string[] | undefined;
  };
  createdAt: number | undefined;
  updatedAt: number | undefined;
}

function HeaderToolbar({
  createdAt,
  updatedAt
}: Pick<ChaosInfrastructureHeaderProps, 'createdAt' | 'updatedAt'>): React.ReactElement {
  const { getString } = useStrings();
  return (
    <Layout.Vertical flex={{ alignItems: 'flex-end' }}>
      <Layout.Horizontal spacing={'xsmall'} flex={{ alignItems: 'center' }}>
        <Text font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_500}>
          <span>{getString('createdOn').toUpperCase()}:</span> {createdAt && getDetailedTime(createdAt)} |{' '}
          <span>{getString('lastModified').toUpperCase()}:</span> {updatedAt && getDetailedTime(updatedAt)}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  );
}

export default function ChaosInfrastructureHeader({
  title,
  environmentData,
  createdAt,
  updatedAt,
  breadcrumbs,
  children
}: React.PropsWithChildren<ChaosInfrastructureHeaderProps>): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Layout.Horizontal width="100%" height="100vh" flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Container flex className={css.leftSideBar}>
        <MainNav />
        <SideNav />
      </Container>
      <Layout.Vertical style={{ flexGrow: 1 }} height="100%">
        <Container
          style={{ background: `var(--primary-1)`, maxHeight: '105px' }}
          padding={{ left: 'xlarge', right: 'xlarge', top: 'small', bottom: 'small' }}
          border={{ bottom: true, color: Color.GREY_200 }}
        >
          <LitmusBreadCrumbs links={breadcrumbs} />
          <Layout.Horizontal margin={{ top: 'medium' }} flex={{ alignItems: 'center' }}>
            <Layout.Vertical flex={{ alignItems: 'flex-start' }}>
              <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="medium">
                <Heading
                  style={{ marginRight: '32px' }}
                  level={4}
                  font={{ variation: FontVariation.H4 }}
                  color={Color.GREY_700}
                >
                  {title}
                </Heading>
                <Layout.Horizontal spacing="small">
                  <Text
                    flex={{ alignItems: 'center' }}
                    className={cx(css.environmentType, {
                      [css.production]: environmentData.environmentType === EnvironmentType.NON_PROD
                    })}
                    font={{ size: 'small' }}
                  >
                    {getString(environmentData.environmentType === EnvironmentType.PROD ? 'prod' : 'preProd')}
                  </Text>
                </Layout.Horizontal>
              </Layout.Horizontal>
              <Layout.Horizontal flex={{ alignItems: 'center' }} className={css.gap4}>
                {environmentData.environmentDescription && (
                  <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="xsmall">
                    <Text
                      flex={{ alignItems: 'center' }}
                      font={{ variation: FontVariation.SMALL_SEMI }}
                      color={Color.GREY_500}
                    >
                      {getString('description')}:
                    </Text>
                    <Text
                      flex={{ alignItems: 'center' }}
                      font={{ variation: FontVariation.SMALL }}
                      color={Color.GREY_500}
                      lineClamp={1}
                    >
                      {environmentData.environmentDescription?.length > 80
                        ? `${environmentData.environmentDescription?.slice(0, 80)}...`
                        : environmentData.environmentDescription}
                    </Text>
                  </Layout.Horizontal>
                )}
                {environmentData.environmentTags && (
                  <CustomTagsPopover tags={defaultTo(environmentData.environmentTags, [])} />
                )}
              </Layout.Horizontal>
            </Layout.Vertical>
            <HeaderToolbar createdAt={createdAt} updatedAt={updatedAt} />
          </Layout.Horizontal>
        </Container>
        {children}
      </Layout.Vertical>
    </Layout.Horizontal>
  );
}
