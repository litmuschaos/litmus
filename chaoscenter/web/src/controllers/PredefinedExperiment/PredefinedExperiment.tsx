import React from 'react';
import { useParams } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import { getPredefinedExperiment } from '@api/core';
import { getScope } from '@utils';
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

  const [
    getPredefinedExperimentQuery,
    { data: predefinedExperiment, loading: getPredefinedExperimentLoading }
  ] = getPredefinedExperiment({
    ...scope,
    hubID: hubID as string,
    experiments: [experimentName as string],
    options: {
      onError: error => showError(error.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  React.useEffect(() => {
    if (hubID && experimentName) {
      getPredefinedExperimentQuery();
    }
  }, [hubID, experimentName, getPredefinedExperimentQuery]);

  return (
    <Loader loading={getPredefinedExperimentLoading} height={'100vh'}>
      <PredefinedExperimentView
        predefinedExperimentDetails={predefinedExperiment?.getPredefinedExperiment?.[0]}
        // TODO: remove search param as prop
        chartName={chartName as string}
        loading={{
          listPredefinedExperiment: getPredefinedExperimentLoading
        }}
      />
    </Loader>
  );
}
