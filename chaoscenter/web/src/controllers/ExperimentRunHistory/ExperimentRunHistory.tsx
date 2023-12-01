import React from 'react';
import { Layout, Text, useToaster, Utils } from '@harnessio/uicore';
import { useParams } from 'react-router-dom';
import { Color } from '@harnessio/design-system';
import { isEqual } from 'lodash-es';
import { listExperimentRunForHistory } from '@api/core';
import { getScope, getColorBasedOnResilienceScore, cronEnabled } from '@utils';
import ExperimentRunHistoryView from '@views/ExperimentRunHistory';
import { useStrings } from '@strings';
import { ExperimentRun, ExperimentType } from '@api/entities';
import type { ColumnData } from '@components/ColumnChart/ColumnChart.types';
import {
  initialExperimentRunFilterState,
  useExperimentRunsFilter,
  useSearchParams,
  useUpdateSearchParams,
  useRouteWithBaseUrl
} from '@hooks';
import RightSideBarV2 from '@components/RightSideBarV2';
import type { UseRouteDefinitionsProps } from '@routes/RouteDefinitions';
import {
  DateRangePicker,
  ExperimentRunSearchBar,
  FilterProps,
  StatusDropDown,
  ResetFilterButton
} from './ExperimentRunFilter';
import type { ExperimentRunHistoryTableProps } from './types';
import { generateExperimentRunTableContent } from './helpers';

const Tooltip = ({ experimentRun }: { experimentRun: ExperimentRun }): React.ReactElement => {
  const { getString } = useStrings();
  const TooltipRow = ({
    property,
    value
  }: {
    property: string;
    value: string | number | undefined;
  }): React.ReactElement => (
    <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}>
      <Text color={Color.BLACK} font={{ size: 'normal', weight: 'semi-bold' }} width={135}>
        {property} :
      </Text>
      <Text font={{ size: 'normal', weight: 'semi-bold' }}>{value}</Text>
    </Layout.Horizontal>
  );
  return (
    <Layout.Vertical spacing={'small'}>
      <TooltipRow property={getString('experimentRunID')} value={experimentRun.experimentRunID.slice(0, 8)} />
      <TooltipRow property={getString('resiliencyScore')} value={`${experimentRun.resiliencyScore}% `} />
    </Layout.Vertical>
  );
};

function generateColumnGraphData(
  experimentRunsWithExecutionData: Array<ExperimentRun>,
  paths: UseRouteDefinitionsProps
): ColumnData[] {
  const content: ColumnData[] = experimentRunsWithExecutionData.map(individualRun => {
    return {
      color: Utils.getRealCSSColor(getColorBasedOnResilienceScore(individualRun.resiliencyScore).primary),
      height: individualRun.resiliencyScore ?? 0,
      path: paths.toExperimentRunDetails({
        experimentID: individualRun.experimentID,
        runID: individualRun.experimentRunID
      }),
      popoverContent: <Tooltip experimentRun={individualRun} />
    };
  });
  return content;
}

export default function ExperimentRunHistoryController(): React.ReactElement {
  const scope = getScope();
  const { state, dispatch } = useExperimentRunsFilter();
  const { showError } = useToaster();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const { experimentID } = useParams<{ experimentID: string }>();
  const paths = useRouteWithBaseUrl();

  // State for pagination
  const page = parseInt(searchParams.get('page') ?? '0');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '15'), 30);

  const setPage = (newPage: number): void => updateSearchParams({ page: newPage.toString() });
  const setLimit = (newLimit: number): void => updateSearchParams({ limit: newLimit.toString() });
  const resetPage = (): void => {
    page !== 0 && updateSearchParams({ page: '0' });
  };

  //state to use experiment name from cache if after search api returned no data
  const [experimentNamePersistent, setExperimentNamePersistent] = React.useState<string>();

  const {
    data: experimentRunData,
    loading: listExperimentRunsLoading,
    exists: experimentRunsExists,
    refetch: refetchExperimentRuns
  } = listExperimentRunForHistory({
    ...scope,
    pagination: { page: page, limit: limit },
    experimentIDs: [experimentID],
    options: {
      onError: error => showError(error.message),
      nextFetchPolicy: 'cache-first',
      pollInterval: 10000
    },
    filter: {
      // TODO: update state names now that filters are updated
      experimentRunID: state.experimentRunID,
      experimentRunStatus: state.experimentRunStatus,
      dateRange: state.dateRange
    }
  });

  const totalExperimentRuns = experimentRunData?.listExperimentRun?.totalNoOfExperimentRuns;
  const experimentRunsWithExecutionData = experimentRunData?.listExperimentRun?.experimentRuns;
  const experimentName = experimentRunsWithExecutionData?.[0]?.experimentName;
  const experimentPhase = experimentRunsWithExecutionData?.[0]?.phase;
  const experimentType = experimentRunsWithExecutionData?.[0]?.experimentType;
  const experimentManifest = experimentRunsWithExecutionData?.[0]?.experimentManifest;

  React.useEffect(() => {
    if (experimentName) setExperimentNamePersistent(experimentName);
  }, [experimentName]),
    [experimentName];

  const experimentRunsTableData: ExperimentRunHistoryTableProps | undefined = experimentRunsWithExecutionData && {
    content: generateExperimentRunTableContent(experimentRunsWithExecutionData),
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

  const experimentRunsColumnGraphData =
    experimentRunsWithExecutionData && generateColumnGraphData(experimentRunsWithExecutionData, paths);

  const filterProps: FilterProps = {
    state,
    dispatch,
    resetPage
  };

  const areFiltersSet = !(isEqual(state, initialExperimentRunFilterState) && page === 0);

  const parsedManifest = experimentManifest && JSON.parse(experimentManifest);

  const isCronEnabled =
    experimentRunsWithExecutionData && experimentType === ExperimentType.CRON && cronEnabled(parsedManifest);

  const rightSideBarV2 = (
    <RightSideBarV2
      refetchExperimentRuns={refetchExperimentRuns}
      experimentID={experimentID}
      phase={experimentPhase}
      isCronEnabled={isCronEnabled}
      experimentType={experimentType}
    />
  );

  return (
    <ExperimentRunHistoryView
      statusDropDown={<StatusDropDown {...filterProps} />}
      dateRangePicker={<DateRangePicker {...filterProps} />}
      experimentRunSearchBar={<ExperimentRunSearchBar {...filterProps} />}
      resetFilterButton={<ResetFilterButton {...filterProps} />}
      loading={listExperimentRunsLoading}
      rightSideBar={rightSideBarV2}
      experimentName={experimentName ?? experimentNamePersistent}
      experimentRunsTableData={experimentRunsTableData}
      experimentRunsColumnGraphData={experimentRunsColumnGraphData}
      areFiltersSet={areFiltersSet}
      experimentRunsExists={experimentRunsExists}
    />
  );
}
