import React from 'react';
import { useParams } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import { listPredefinedExperiment } from '@api/core';
import { getScope } from '@utils';
import type { PredefinedExperiment } from '@api/entities';
import PredefinedExperimentView from '@views/PredefinedExperiment';
import { useSearchParams } from '@hooks';
import Loader from '@components/Loader';

export default function PredefinedExperimentController(): React.ReactElement {
  const scope = getScope();
  const { showError } = useToaster();
  const { hubID } = useParams<{ hubID: string }>();
  const { experimentName } = useParams<{ experimentName: string }>();
  const searchParams = useSearchParams();
  const chartName = searchParams.get('chartName');

  // TODO: use get API
  const { data: predefinedExperiments, loading: listPredefinedExperimentLoading } = listPredefinedExperiment({
    ...scope,
    hubID: hubID,
    options: {
      onError: error => showError(error.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  return (
    <Loader loading={listPredefinedExperimentLoading} height={'100vh'}>
      <PredefinedExperimentView
        predefinedExperimentDetails={predefinedExperiments?.listPredefinedExperiments.find(
          (experiment: PredefinedExperiment) => experiment.experimentName === experimentName
        )}
        // TODO: remove search param as prop
        chartName={chartName as string}
        loading={{
          listPredefinedExperiment: listPredefinedExperimentLoading
        }}
      />
    </Loader>
  );
}
