import React from 'react';
import { useParams } from 'react-router-dom';
import { useToaster, VisualYamlSelectedView } from '@harnessio/uicore';
import {
  getKubernetesCMDProbeProperties,
  getKubernetesHTTPProbeProperties,
  getK8SProbeProperties,
  getPROMProbeProperties,
  getProbeYAML
} from '@api/core';
import { getScope } from '@utils';
import ChaosProbeConfigurationView from '@views/ChaosProbeConfiguration';
import { InfrastructureType, Mode, ProbeType } from '@api/entities';
import { useSearchParams } from '@hooks';

interface ChaosProbeConfigurationControllerProps {
  type: ProbeType;
}

export default function ChaosProbeConfigurationController({
  type
}: ChaosProbeConfigurationControllerProps): React.ReactElement {
  const scope = getScope();
  const searchParams = useSearchParams();
  const { probeName } = useParams<{ probeName: string }>();
  const { showError } = useToaster();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;
  // Same pattern ChaosStudio uses for its Visual/YAML toggle (see viewFilter in
  // ChaosStudio.tsx) - the mode lives in the URL, not component state, so it
  // survives refresh/back-nav and both the controller and view can read it
  // independently without prop drilling.
  const viewMode = (searchParams.get('view') as VisualYamlSelectedView) ?? VisualYamlSelectedView.VISUAL;

  const [
    getKubernetesHTTPProbePropertiesQuery,
    { loading: getKubernetesHTTPProbePropertiesLoading, data: kubernetesHTTPProperties }
  ] = getKubernetesHTTPProbeProperties({
    ...scope,
    probeName: probeName,
    options: {
      onError: err => showError(err.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  const [getPROMProbePropertiesQuery, { loading: getPROMProbePropertiesLoading, data: promProperties }] =
    getPROMProbeProperties({
      ...scope,
      probeName: probeName,
      options: {
        onError: err => showError(err.message),
        nextFetchPolicy: 'cache-first'
      }
    });

  const [getK8SProbePropertiesQuery, { loading: getK8SProbePropertiesLoading, data: k8sProperties }] =
    getK8SProbeProperties({
      ...scope,
      probeName: probeName,
      options: {
        onError: err => showError(err.message),
        nextFetchPolicy: 'cache-first'
      }
    });

  const [
    getKubernetesCMDProbePropertiesQuery,
    { loading: getKubernetesCMDProbePropertiesLoading, data: kubernetesCMDproperties }
  ] = getKubernetesCMDProbeProperties({
    ...scope,
    probeName: probeName,
    options: {
      onError: err => showError(err.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  const [getProbeYAMLQuery, { loading: probeYAMLLoading, data: probeYAMLData }] = getProbeYAML({
    projectID: scope.projectID,
    probeID: probeName,
    mode: Mode.SoT,
    options: {
      onError: err => showError(err.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  React.useEffect(() => {
    if (infrastructureType === InfrastructureType.KUBERNETES) {
      switch (type) {
        case ProbeType.HTTP:
          getKubernetesHTTPProbePropertiesQuery({
            variables: { projectID: scope.projectID, probeName: probeName }
          });
          break;
        case ProbeType.PROM:
          getPROMProbePropertiesQuery({
            variables: { projectID: scope.projectID, probeName: probeName }
          });
          break;
        case ProbeType.K8S:
          getK8SProbePropertiesQuery({
            variables: { projectID: scope.projectID, probeName: probeName }
          });
          break;
        case ProbeType.CMD:
          getKubernetesCMDProbePropertiesQuery({
            variables: { projectID: scope.projectID, probeName: probeName }
          });
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, probeName, infrastructureType]);

  // Fetch the probe YAML lazily, only once the user switches to the YAML tab.
  // getProbeYAMLQuery's variables (projectID/probeID/mode) are already bound
  // when the hook is created above, so it's safe to call with no arguments.
  // The hook's default fetchPolicy is 'cache-and-network' (see
  // api/core/probe/getProbeYAML.ts) with nextFetchPolicy 'cache-first', so the
  // first call always hits the network and any later call (e.g. toggling back
  // to the YAML tab) is served from Apollo's cache instead of re-fetching.
  // scope.projectID isn't referenced in the body (it's baked into the query
  // above), so it's intentionally left out of the dependency array.
  React.useEffect(() => {
    if (!probeName || viewMode !== VisualYamlSelectedView.YAML) {
      return;
    }

    getProbeYAMLQuery();
  }, [getProbeYAMLQuery, probeName, viewMode]);

  const probeData =
    infrastructureType === InfrastructureType.KUBERNETES
      ? kubernetesHTTPProperties?.getProbe ||
        promProperties?.getProbe ||
        k8sProperties?.getProbe ||
        kubernetesCMDproperties?.getProbe
      : undefined;

  const loading =
    getKubernetesHTTPProbePropertiesLoading ||
    getPROMProbePropertiesLoading ||
    getK8SProbePropertiesLoading ||
    getKubernetesCMDProbePropertiesLoading;

  return (
    <ChaosProbeConfigurationView
      loading={loading}
      probeData={probeData}
      probeYAML={probeYAMLData?.getProbeYAML}
      probeYAMLLoading={probeYAMLLoading}
    />
  );
}
