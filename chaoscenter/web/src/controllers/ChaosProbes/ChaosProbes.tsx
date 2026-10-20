import { useToaster } from '@harnessio/uicore';
import React from 'react';
import { isEqual } from 'lodash-es';
import { getScope } from '@utils';
import ChaosProbesView from '@views/ChaosProbes';
import { listProbes } from '@api/core';
import { initialProbeFilterState, useProbeFilter } from 'hooks/useProbeFilter';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import type { ChaosProbesTableProps } from './types';
import { generateChaosProbesDashboardTableContent } from './helpers';
import {
  ChaosProbeFilterProps,
  DateRangePicker,
  ProbeSearchBar,
  ProbeTypeDropdown,
  ResetFilterButton
} from './ChaosProbeFilter';

export default function ChaosProbesController(): React.ReactElement {
  const scope = getScope();
  const { state, dispatch } = useProbeFilter();
  const { showError } = useToaster();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  // State for pagination
  const page = parseInt(searchParams.get('page') ?? '0');
  const resetPage = (): void => {
    page !== 0 && updateSearchParams({ page: '0' });
  };

  const { data, loading, refetch } = listProbes({
    projectID: scope.projectID,
    options: {
      onError: err => showError(err.message)
    },
    filter: {
      name: state.probeName,
      dateRange: state.dateRange,
      type: state.probeType
    }
  });

  const filterProps: ChaosProbeFilterProps = {
    state,
    dispatch,
    resetPage
  };

  const probes = data?.listProbes;

  const chaosProbesTableData: ChaosProbesTableProps | undefined = probes && {
    content: generateChaosProbesDashboardTableContent(probes)
  };

  const areFiltersSet = !(isEqual(state, initialProbeFilterState) && page === 0);

  return (
    <ChaosProbesView
      dateRangePicker={<DateRangePicker {...filterProps} />}
      probeSearchBar={<ProbeSearchBar {...filterProps} />}
      resetFilterButton={<ResetFilterButton {...filterProps} />}
      probeTypeDropDown={<ProbeTypeDropdown {...filterProps} />}
      chaosProbesTableData={chaosProbesTableData}
      areFiltersSet={areFiltersSet}
      refetchProbes={refetch}
      loading={loading}
    />
  );
}
