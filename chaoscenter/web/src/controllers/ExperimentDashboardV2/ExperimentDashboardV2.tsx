/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { isEqual } from 'lodash-es';
import { getScope } from '@utils';
import { initialExperimentFilterState, useExperimentFilter, useSearchParams, useUpdateSearchParams } from '@hooks';
import { listExperiment } from '@api/core';
import ExperimentDashboardV2View from '@views/ExperimentDashboardV2';
import type { ExperimentDashboardTableProps } from './types';
import { generateExperimentDashboardTableContent } from './helpers';
import {
  DateRangePicker,
  ExperimentSearchBar,
  FilterProps,
  InfraIdDropdown,
  InfraTypeDropdown,
  ResetFilterButton,
  ScheduleDropDown
} from './ExperimentFilter';

export default function ExperimentDashboardV2Controller(): React.ReactElement {
  const scope = getScope();
  const { state, dispatch } = useExperimentFilter();
  const { showError } = useToaster();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  // State for pagination
  const page = parseInt(searchParams.get('page') ?? '0');
  const limit = parseInt(searchParams.get('limit') ?? '15');

  const setPage = (newPage: number): void => updateSearchParams({ page: newPage.toString() });
  const setLimit = (newLimit: number): void => updateSearchParams({ limit: newLimit.toString() });
  const resetPage = (): void => {
    page !== 0 && updateSearchParams({ page: '0' });
  };

  const {
    data: experimentRunData,
    loading: listExperimentLoading,
    exists: experimentExists,
    refetch: refetchExperiments
  } = listExperiment({
    ...scope,
    pagination: { page: page, limit: limit },
    options: {
      onError: error => showError(error.message),
      nextFetchPolicy: 'cache-first',
      pollInterval: 10000
    },
    filter: {
      experimentName: state.experimentName,
      infraID: state.infraID,
      scheduleType: state.schedule,
      dateRange: state.dateRange
    }
  });

  const totalExperimentRuns = experimentRunData?.listExperiment.totalNoOfExperiments;
  const experiments = experimentRunData?.listExperiment.experiments;

  const experimentDashboardTableData: ExperimentDashboardTableProps | undefined = experiments && {
    content: generateExperimentDashboardTableContent(experiments),
    pagination: {
      gotoPage: event => setPage(event),
      itemCount: totalExperimentRuns ?? 0,
      pageCount: totalExperimentRuns ? Math.ceil(totalExperimentRuns / limit) : 1,
      pageIndex: page,
      pageSizeOptions: [...new Set([15, 30, limit])].sort(),
      pageSize: limit,
      onPageSizeChange: event => setLimit(event)
    }
  };

  const filterProps: FilterProps = {
    state,
    dispatch,
    resetPage
  };

  const areFiltersSet = !(isEqual(state, initialExperimentFilterState) && page === 0);

  return (
    <ExperimentDashboardV2View
      dateRangePicker={<DateRangePicker {...filterProps} />}
      experimentSearchBar={<ExperimentSearchBar {...filterProps} />}
      resetFilterButton={<ResetFilterButton {...filterProps} />}
      scheduleDropDown={<ScheduleDropDown {...filterProps} />}
      infraTypeDropDown={<InfraTypeDropdown {...filterProps} />}
      infraIdDropdown={<InfraIdDropdown {...filterProps} />}
      refetchExperiments={refetchExperiments}
      loading={listExperimentLoading}
      experimentExists={experimentExists}
      areFiltersSet={areFiltersSet}
      experimentDashboardTableData={experimentDashboardTableData}
    />
  );
}
