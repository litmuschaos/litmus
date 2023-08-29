import React from 'react';
import { Container, Layout, TabNavigation, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { useParams } from 'react-router-dom';
import ColumnChart from '@components/ColumnChart/ColumnChart';
import { useStrings } from '@strings';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import type { ExperimentRunHistoryTableProps } from '@controllers/ExperimentRunHistory';
import Loader from '@components/Loader';
import NoFilteredData from '@components/NoFilteredData';
import FallbackBox from '@images/FallbackBox.svg';
import type { ColumnData } from '@components/ColumnChart/ColumnChart.types';
import { GenericErrorHandler } from '@errors';
import { getScope } from '@utils';
import { useRouteWithBaseUrl } from '@hooks';
import { StudioTabs } from '@models';
import { MemoisedExperimentRunHistoryTable } from './ExperimentRunHistoryTable';

interface ExperimentRunHistoryViewProps {
  statusDropDown: React.ReactElement;
  dateRangePicker: React.ReactElement;
  experimentRunSearchBar: React.ReactElement;
  resetFilterButton: React.ReactElement;
  rightSideBar?: React.ReactElement;
  experimentName: string | undefined;
  experimentRunsTableData: ExperimentRunHistoryTableProps | undefined;
  experimentRunsColumnGraphData: ColumnData[] | undefined;
  loading: boolean;
  areFiltersSet: boolean;
  experimentRunsExists: boolean | undefined;
}

const ExperimentRunHistoryView = ({
  statusDropDown,
  dateRangePicker,
  experimentRunSearchBar,
  resetFilterButton,
  rightSideBar,
  experimentName,
  experimentRunsTableData,
  experimentRunsColumnGraphData,
  loading,
  areFiltersSet,
  experimentRunsExists
}: ExperimentRunHistoryViewProps): React.ReactElement => {
  const scope = getScope();
  const paths = useRouteWithBaseUrl();
  const { getString } = useStrings();
  const { experimentID } = useParams<{ experimentID: string }>();

  const headerTitle = loading && !experimentName ? undefined : experimentName ?? experimentID;

  const breadcrumbs = [
    {
      label: getString('chaosExperiments'),
      url: paths.toExperiments()
    }
  ];

  if (experimentRunsExists !== undefined && !experimentRunsExists && !areFiltersSet)
    return (
      <GenericErrorHandler
        errStatusCode={400}
        errorMessage={getString('genericResourceNotFoundError', {
          resource: getString('experimentID'),
          resourceID: experimentID,
          projectID: scope.projectID
        })}
      />
    );

  return (
    <DefaultLayoutTemplate
      title={headerTitle}
      breadcrumbs={breadcrumbs}
      rightSideBar={rightSideBar}
      headerToolbar={
        <Container style={{ marginTop: '-2rem' }}>
          <TabNavigation
            size={'small'}
            links={[
              {
                label: getString('chaosStudio'),
                to: paths.toEditExperiment({ experimentKey: experimentID }) + `?tab=${StudioTabs.BUILDER}`
              },
              {
                label: getString('runHistory'),
                to: paths.toExperimentRunHistory({ experimentID: experimentID })
              }
            ]}
          />
        </Container>
      }
    >
      <Layout.Vertical spacing={'medium'} padding={{ left: 'small', right: 'small' }}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          {statusDropDown}
          <Layout.Horizontal spacing={'medium'}>
            {experimentRunSearchBar}
            {dateRangePicker}
          </Layout.Horizontal>
        </Layout.Horizontal>
        <Text font={{ variation: FontVariation.H5 }}>{getString('resilienceScoreTrends')}</Text>
        {/* <!-- Column Chart goes here--> */}
        <ColumnChart
          xAxisLabel="Runs"
          yAxisLabel="Resilience Score"
          gridLines={[0, 35, 65, 100]}
          data={experimentRunsColumnGraphData}
          isLoading={loading}
        />
      </Layout.Vertical>
      <Layout.Vertical margin={{ top: 'xlarge' }} spacing={'medium'} padding={{ left: 'small', right: 'small' }}>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Text font={{ variation: FontVariation.H5 }}>
            {getString('experimentRuns')}
            {` (${experimentRunsTableData?.pagination?.itemCount ?? ''})`}
          </Text>
          <Layout.Horizontal spacing={'medium'}>{/* {statusDropDown} */}</Layout.Horizontal>
        </Layout.Horizontal>
        <Container height={'calc(100vh - 444px)'}>
          <Loader loading={loading}>
            {experimentRunsTableData && experimentRunsTableData.content.length ? (
              // <!-- Run History Table goes here -->
              <MemoisedExperimentRunHistoryTable {...experimentRunsTableData} />
            ) : areFiltersSet ? (
              // <!-- No data after setting filters -->
              <NoFilteredData resetButton={resetFilterButton} />
            ) : (
              // <!-- No data -->
              <Layout.Vertical flex={{ justifyContent: 'center' }} height={'100%'}>
                <img src={FallbackBox} alt={getString('latestRun')} />
                <Text font={{ variation: FontVariation.BODY1 }} padding={{ top: 'large' }} color={Color.GREY_500}>
                  {getString('latestRunFallbackText')}
                </Text>
              </Layout.Vertical>
            )}
          </Loader>
        </Container>
      </Layout.Vertical>
    </DefaultLayoutTemplate>
  );
};

export default ExperimentRunHistoryView;
