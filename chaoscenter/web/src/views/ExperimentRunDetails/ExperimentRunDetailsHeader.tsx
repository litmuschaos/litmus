import React from 'react';
import { Container, Heading, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import type { DefaultLayoutTemplateProps } from '@components/DefaultLayout/DefaultLayout';
import type { ExecutionData, ExperimentRunStatus } from '@api/entities';
import { useStrings } from '@strings';
import ResiliencyScoreArrowCard from '@components/ResiliencyScoreArrowCard';
import { getDurationBetweenTwoDates, handleTimestampAmbiguity } from '@utils';
import StatusBadgeV2, { StatusBadgeEntity } from '@components/StatusBadgeV2';
import LitmusBreadCrumbs from '@components/LitmusBreadCrumbs';
import Duration from '@components/Duration';
import MainNav from '@components/MainNav';
import SideNav from '@components/SideNav';
import css from './ExperimentRunDetailsHeader.module.scss';

interface ExperimentRunDetailsHeaderProps extends DefaultLayoutTemplateProps {
  resiliencyScore?: number;
  infrastructureName?: string;
  experimentExecutionDetails?: ExecutionData;
  phase?: ExperimentRunStatus;
  rightSideBar?: React.ReactElement;
}

export default function ExperimentRunDetailsHeader({
  title,
  breadcrumbs,
  children,
  resiliencyScore,
  infrastructureName,
  experimentExecutionDetails,
  phase,
  rightSideBar
}: React.PropsWithChildren<ExperimentRunDetailsHeaderProps>): React.ReactElement {
  const { getString } = useStrings();
  const breadCrumb = <LitmusBreadCrumbs links={breadcrumbs} />;
  return (
    <Container className={css.test} flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <Container flex className={css.leftSideBar}>
        <MainNav />
        <SideNav />
      </Container>
      <Layout.Horizontal style={{ flexGrow: 1 }} flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Container className={css.flexGrow}>
          <Layout.Horizontal
            padding={{ left: 'xlarge', right: 'xlarge', top: 'small', bottom: 'small' }}
            border={{ bottom: true, color: Color.GREY_200 }}
            background={Color.WHITE}
            flex
            height={120}
          >
            <Container>
              {breadCrumb}
              <Layout.Vertical flex={{ alignItems: 'flex-start' }} style={{ marginTop: '14px' }}>
                <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="medium">
                  <Heading level={4} font={{ variation: FontVariation.H4 }} color={Color.GREY_700}>
                    {title ?? <Icon name="steps-spinner" size={22} color={Color.GREY_800} />}
                  </Heading>
                  {phase && <StatusBadgeV2 status={phase} entity={StatusBadgeEntity.ExperimentRun} />}
                </Layout.Horizontal>
              </Layout.Vertical>
              <Layout.Horizontal
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                className={css.gap4}
                style={{ marginTop: '12px' }}
              >
                <Layout.Horizontal flex={{ alignItems: 'center' }} className={css.gap1}>
                  <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_450}>
                    {getString('hostedOn')}
                  </Text>
                  {infrastructureName ? (
                    <Text font={{ variation: FontVariation.SMALL }} color={Color.BLACK}>
                      {getString('infrastructure')}: {infrastructureName}
                    </Text>
                  ) : (
                    <Icon name="steps-spinner" size={14} color={Color.GREY_800} />
                  )}
                </Layout.Horizontal>
                <div className={css.hr} />
                <Layout.Horizontal flex={{ alignItems: 'center' }} className={css.gap1}>
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_450}>
                    {getString('duration')}
                  </Text>
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.BLACK}>
                    {experimentExecutionDetails ? (
                      getDurationBetweenTwoDates(
                        parseInt(handleTimestampAmbiguity(experimentExecutionDetails?.startedAt)),
                        parseInt(handleTimestampAmbiguity(experimentExecutionDetails?.finishedAt))
                      )
                    ) : (
                      <Icon name="steps-spinner" size={14} color={Color.GREY_800} />
                    )}
                  </Text>
                  {experimentExecutionDetails && (
                    <Duration
                      startTime={parseInt(handleTimestampAmbiguity(experimentExecutionDetails?.startedAt))}
                      endTime={parseInt(handleTimestampAmbiguity(experimentExecutionDetails?.finishedAt))}
                      icon="time"
                      iconProps={{ size: 12 }}
                      durationText=" "
                      color={Color.BLACK}
                      font={{ size: 'small' }}
                    />
                  )}
                </Layout.Horizontal>
              </Layout.Horizontal>
            </Container>
            <ResiliencyScoreArrowCard title={getString('resiliencyScore')} phase={phase} score={resiliencyScore} />
          </Layout.Horizontal>
          {children}
        </Container>
        {rightSideBar && <Container className={css.rightSideBar}>{rightSideBar}</Container>}
      </Layout.Horizontal>
    </Container>
  );
}
