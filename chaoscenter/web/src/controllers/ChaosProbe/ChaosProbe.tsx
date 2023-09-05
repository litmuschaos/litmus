import React from 'react';
import { useParams } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import { getScope } from '@utils';
import { getProbe } from '@api/core';
import ChaosProbeView from '@views/ChaosProbe';

export default function ChaosProbeController(): React.ReactElement {
  const scope = getScope();
  const { probeName } = useParams<{ probeName: string }>();
  const { showError } = useToaster();

  const { data, loading } = getProbe({
    ...scope,
    probeName: probeName,
    options: {
      onError: err => showError(err.message)
    }
  });

  const probeData = data?.getProbe;

  return <ChaosProbeView loading={loading} probeData={probeData} />;
}
