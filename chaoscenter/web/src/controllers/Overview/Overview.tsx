import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { getChaosHubStats, getExperimentStats, getInfraStats, listExperiment } from '@api/core';
import { getScope, getUserDetails } from '@utils';
import OverviewView from '@views/Overview';
import { generateExperimentDashboardTableContent } from '@controllers/ExperimentDashboardV2/helpers';
import type { ExperimentDashboardTableProps } from '@controllers/ExperimentDashboardV2';
import { useGetUserQuery } from '@api/auth';

export default function OverviewController(): React.ReactElement {
  const scope = getScope();
  const { showError } = useToaster();
  const userDetails = getUserDetails();

  const { data: chaosHubStats, loading: loadingChaosHubStats } = getChaosHubStats({
    ...scope
  });

  const { data: infraStats, loading: loadingInfraStats } = getInfraStats({
    ...scope
  });
  const { data: experimentStats, loading: loadingExperimentStats } = getExperimentStats({
    ...scope
  });

  const {
    data: experimentRunData,
    loading: loadingRecentExperimentsTable,
    refetch: refetchExperiments
  } = listExperiment({
    ...scope,
    pagination: { page: 0, limit: 7 },
    options: {
      onError: error => showError(error.message),
      nextFetchPolicy: 'cache-first',
      pollInterval: 10000
    }
  });

  const { data: currentUserData, isLoading: getUserLoading } = useGetUserQuery(
    {
      user_id: userDetails.accountID
    },
    {
      enabled: !!userDetails.accountID
    }
  );

  const experiments = experimentRunData?.listExperiment.experiments;

  const experimentDashboardTableData: ExperimentDashboardTableProps | undefined = experiments && {
    content: generateExperimentDashboardTableContent(experiments)
  };

  return (
    <OverviewView
      loading={{
        chaosHubStats: loadingChaosHubStats,
        infraStats: loadingInfraStats,
        experimentStats: loadingExperimentStats,
        recentExperimentsTable: loadingRecentExperimentsTable,
        getUser: getUserLoading
      }}
      currentUserData={currentUserData}
      chaosHubStats={chaosHubStats?.getChaosHubStats}
      infraStats={infraStats?.getInfraStats}
      experimentStats={experimentStats?.getExperimentStats}
      experimentDashboardTableData={experimentDashboardTableData}
      refetchExperiments={refetchExperiments}
    />
  );
}
