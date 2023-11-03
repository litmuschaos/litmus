import React from 'react';
import { useParams } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import { parse } from 'yaml';
import { getChaosFault, getPredefinedExperiment } from '@api/core';
import { getScope } from '@utils';
import ChaosFaultView from '@views/ChaosFault';
import { useSearchParams } from '@hooks';
import type { PredefinedExperiment } from '@api/entities';

export default function ChaosFaultController(): React.ReactElement {
  const scope = getScope();
  const { showError } = useToaster();
  const { hubID } = useParams<{ hubID: string }>();
  const { faultName } = useParams<{ faultName: string }>();
  const searchParams = useSearchParams();
  const chartName = searchParams.get('chartName');
  const [experimentList, setExperimentList] = React.useState<Array<PredefinedExperiment>>([]);

  const { data, loading } = getChaosFault({
    ...scope,
    request: {
      category: chartName ?? '',
      experimentName: faultName,
      hubID: hubID
    },
    options: {
      onError: error => showError(error.message),
      onCompleted: fault => {
        if (fault.getChaosFault && fault.getChaosFault.csv) {
          const faultCSV = parse(fault.getChaosFault.csv);
          const experiments = faultCSV.spec?.experiments;
          getPredefinedExperimentQuery({
            variables: {
              projectID: scope.projectID,
              hubID: hubID,
              experiments: experiments.length ? experiments : []
            }
          });
        }
      },
      nextFetchPolicy: 'cache-first'
    }
  });

  const [getPredefinedExperimentQuery, { loading: predefineWorflowLoading }] = getPredefinedExperiment({
    ...scope,
    options: {
      onCompleted: predefinedExperiment => {
        if (predefinedExperiment.getPredefinedExperiment) {
          setExperimentList(predefinedExperiment.getPredefinedExperiment);
        }
      },
      onError: error => showError(error.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  return (
    <ChaosFaultView
      faultDetails={data?.getChaosFault}
      chartName={chartName as string}
      loading={{
        getHubFaults: loading,
        getHubExperiment: predefineWorflowLoading
      }}
      experiments={experimentList}
    />
  );
}
