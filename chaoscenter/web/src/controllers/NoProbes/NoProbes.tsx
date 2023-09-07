import { useToaster } from '@harnessio/uicore';
import React from 'react';
import type { ApolloQueryResult } from '@apollo/client';
import NoProbes from '@views/ExperimentCreationFaultConfiguration/Tabs/Probes/SelectProbesTab/NoProbes';
import { addKubernetesCMDProbe, ListProbeRequest, ListProbeResponse } from '@api/core';

interface NoProbesControllerProps {
  refetch: (variables?: Partial<ListProbeRequest> | undefined) => Promise<ApolloQueryResult<ListProbeResponse>>;
}

export default function NoProbesController({ refetch }: NoProbesControllerProps): React.ReactElement {
  const { showError } = useToaster();

  const [addKubernetesCMDProbeMutation, { loading: addKubernetesCMDProbeLoading }] = addKubernetesCMDProbe({
    onCompleted: () => {
      refetch();
    },
    onError: err => showError(err.message)
  });

  const loading = addKubernetesCMDProbeLoading;

  return <NoProbes loading={loading} addKubernetesCMDProbeMutation={addKubernetesCMDProbeMutation} />;
}
