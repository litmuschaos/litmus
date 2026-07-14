import React from 'react';
import { Layout } from '@harnessio/uicore';
import { isEmpty } from 'lodash-es';
import { useStrings } from '@strings';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import NewExperimentButton from '@components/NewExperimentButton';
import NoFilteredData from '@components/NoFilteredData';
import NewUserLanding from '@components/NewUserLanding';
import type { ExperimentDashboardTableProps, RefetchExperiments } from '@controllers/ExperimentDashboardV2';
import { useDocumentTitle } from '@hooks';
import { MemoisedExperimentDashboardV2Table } from './ExperimentDashboardV2Table';

interface ExperimentRunHistoryViewProps {
  dateRangePicker: React.ReactElement;
  experimentSearchBar: React.ReactElement;
  resetFilterButton: React.ReactElement;
  scheduleDropDown: React.ReactElement;
  infraTypeDropDown: React.ReactElement;
  infraIdDropdown: React.ReactElement;
  loading: boolean;
  areFiltersSet: boolean;
  experimentExists: boolean | undefined;
  experimentDashboardTableData: ExperimentDashboardTableProps | undefined;
}

const ExperimentDashboardV2View = ({
  dateRangePicker,
  experimentSearchBar,
  scheduleDropDown,
  // infraTypeDropDown,
  infraIdDropdown,
  resetFilterButton,
  experimentDashboardTableData,
  refetchExperiments,
  areFiltersSet,
  loading
}: ExperimentRunHistoryViewProps & RefetchExperiments): React.ReactElement => {
  const { getString } = useStrings();

  useDocumentTitle(getString('chaosExperiments'));

  const headerTitle = getString('chaosExperiments');

  const filterBar = (
    <Layout.Horizontal width={'100%'} flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Layout.Horizontal spacing={'medium'}>
        <NewExperimentButton />
        {scheduleDropDown}
        {infraIdDropdown}
      </Layout.Horizontal>
      <Layout.Horizontal spacing={'medium'}>
        {experimentSearchBar}
        {dateRangePicker}
      </Layout.Horizontal>
    </Layout.Horizontal>
  );

  return (
    <DefaultLayoutTemplate title={headerTitle} breadcrumbs={[]} loading={loading} subHeader={filterBar}>
      <Layout.Vertical height={'100%'} spacing={'medium'} padding={{ left: 'small', right: 'small' }}>
        {experimentDashboardTableData?.content && !isEmpty(experimentDashboardTableData?.content) ? (
          <MemoisedExperimentDashboardV2Table
            {...experimentDashboardTableData}
            refetchExperiments={refetchExperiments}
          />
        ) : areFiltersSet ? (
          <NoFilteredData resetButton={resetFilterButton} />
        ) : (
          <NewUserLanding height={'100%'} />
        )}
      </Layout.Vertical>
    </DefaultLayoutTemplate>
  );
};

export default ExperimentDashboardV2View;
