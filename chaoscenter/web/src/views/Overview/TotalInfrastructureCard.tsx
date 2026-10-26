import React from 'react';
import { Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { Link } from 'react-router-dom';
import { useStrings } from '@strings';
import { useRouteWithBaseUrl } from '@hooks';
import type { InfraStatsData } from '@api/entities';
import Loader from '@components/Loader';
import css from './Overview.module.scss';

interface TotalInfrastructureCardProps {
  infraStats: InfraStatsData | undefined;
  loading: boolean;
}

export default function TotalInfrastructureCard({
  infraStats,
  loading
}: TotalInfrastructureCardProps): React.ReactElement {
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();

  const pendingInfrastructures = Math.min(
    infraStats?.totalNonConfirmedInfrastructures ?? 0,
    infraStats?.totalInactiveInfrastructures ?? 0
  );

  const inactiveInfrastructures = (infraStats?.totalInactiveInfrastructures ?? 0) - pendingInfrastructures;

  const defaultChartOptions: Highcharts.Options = {
    chart: {
      plotBackgroundColor: 'transparent',
      plotBorderWidth: 0,
      plotShadow: false,
      type: 'pie',
      width: 80,
      height: 90
    },
    title: {
      text: undefined
    },
    tooltip: {
      enabled: false
    },
    accessibility: {
      point: {
        valueSuffix: undefined
      }
    },
    plotOptions: {
      series: {
        enableMouseTracking: false
      },
      pie: {
        allowPointSelect: false,
        cursor: 'pointer',
        size: 60,
        dataLabels: {
          enabled: false
        }
      }
    },
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'pie',
        name: 'deployments',
        colorByPoint: true,
        data: [
          {
            name: 'Active',
            y: infraStats?.totalActiveInfrastructure,
            color: 'var(--primary-6)'
          },
          {
            name: 'InActive',
            y: inactiveInfrastructures,
            color: 'var(--primary-2)'
          },
          {
            name: 'Pending',
            y: pendingInfrastructures,
            color: 'var(--orange-200)'
          }
        ]
      }
    ]
  };

  function CircleSVG({ color }: { color: string }): React.ReactElement {
    return (
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="4" cy="4" r="4" fill={color} />
      </svg>
    );
  }

  return (
    <div className={css.totalEnvironmentCardContainer}>
      <Loader loading={loading} small>
        <div className={css.commonCard}>
          <Layout.Horizontal flex>
            <Text font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }} color={Color.GREY_600}>
              {getString('totalChaosInfrastructures')}
            </Text>
            <Link to={paths.toEnvironments()}>
              <Text font={{ variation: FontVariation.SMALL }} color={Color.PRIMARY_7}>
                {getString('seeAllChaosInfrastructures')}
              </Text>
            </Link>
          </Layout.Horizontal>
          <Layout.Horizontal flex spacing="small">
            <Text font={{ variation: FontVariation.H2 }}>{infraStats?.totalInfrastructures ?? 0}</Text>
            <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="small">
              <HighchartsReact highcharts={Highcharts} options={defaultChartOptions} />
              <Layout.Vertical spacing="xsmall">
                <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="xsmall">
                  <CircleSVG color="#0092E4" />
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                    {getString('active')} ({infraStats?.totalActiveInfrastructure ?? 0})
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="xsmall">
                  <CircleSVG color="#A3E9FF" />
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                    {getString('inactive')} ({inactiveInfrastructures})
                  </Text>
                </Layout.Horizontal>
                <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="xsmall">
                  <CircleSVG color="#FFC195" />
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                    {getString('pending')} ({pendingInfrastructures})
                  </Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Horizontal>
        </div>
      </Loader>
    </div>
  );
}
