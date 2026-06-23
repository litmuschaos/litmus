import React from 'react';
import { useParams } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
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

  React.useMemo(() => {
    if (infrastructureType === InfrastructureType.KUBERNETES) {
      switch (type) {
        case ProbeType.HTTP:
          return getKubernetesHTTPProbePropertiesQuery({
            variables: { projectID: scope.projectID, probeName: probeName }
          });
        case ProbeType.PROM:
          return getPROMProbePropertiesQuery({
            variables: { projectID: scope.projectID, probeName: probeName }
          });
        case ProbeType.K8S:
          return getK8SProbePropertiesQuery({
            variables: { projectID: scope.projectID, probeName: probeName }
          });
        case ProbeType.CMD:
          return getKubernetesCMDProbePropertiesQuery({
            variables: { projectID: scope.projectID, probeName: probeName }
          });
      }
    }
  }, [type, probeName, infrastructureType]);

  React.useEffect(() => {
    if (!probeName) {
      return;
    }

    getProbeYAMLQuery({
      variables: {
        projectID: scope.projectID,
        request: { probeID: probeName, mode: Mode.SoT }
      }
    });
  }, [getProbeYAMLQuery, probeName, scope.projectID]);

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
