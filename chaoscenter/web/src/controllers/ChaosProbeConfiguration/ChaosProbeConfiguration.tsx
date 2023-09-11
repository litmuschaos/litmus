import React from 'react';
import { useParams } from 'react-router-dom';
import { useToaster } from '@harnessio/uicore';
import {
  getKubernetesCMDProbeProperties,
  getKubernetesHTTPProbeProperties,
  getK8SProbeProperties,
  getPROMProbeProperties
} from '@api/core';
import { getScope } from '@utils';
import ChaosProbeConfigurationView from '@views/ChaosProbeConfiguration';
import { InfrastructureType, ProbeType } from '@api/entities';
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

  // Lazy Get Kubernetes HTTP Properties query to avoid pre-rendering at component mounting
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

  // Lazy Get PROM Properties query to avoid pre-rendering at component mounting
  const [getPROMProbePropertiesQuery, { loading: getPROMProbePropertiesLoading, data: promProperties }] =
    getPROMProbeProperties({
      ...scope,
      probeName: probeName,
      options: {
        onError: err => showError(err.message),
        nextFetchPolicy: 'cache-first'
      }
    });

  // Lazy Get K8S Properties query to avoid pre-rendering at component mounting
  const [getK8SProbePropertiesQuery, { loading: getK8SProbePropertiesLoading, data: k8sProperties }] =
    getK8SProbeProperties({
      ...scope,
      probeName: probeName,
      options: {
        onError: err => showError(err.message),
        nextFetchPolicy: 'cache-first'
      }
    });

  // Lazy Get Kubernetes CMD Properties query to avoid pre-rendering at component mounting
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

  React.useMemo(() => {
    if (infrastructureType === InfrastructureType.KUBERNETES) {
      switch (type) {
        case ProbeType.HTTP:
          return getKubernetesHTTPProbePropertiesQuery({
            variables: {
              projectID: scope.projectID,
              probeName: probeName
            }
          });
        case ProbeType.PROM:
          return getPROMProbePropertiesQuery({
            variables: {
              projectID: scope.projectID,
              probeName: probeName
            }
          });
        case ProbeType.K8S:
          return getK8SProbePropertiesQuery({
            variables: {
              projectID: scope.projectID,
              probeName: probeName
            }
          });
        case ProbeType.CMD:
          return getKubernetesCMDProbePropertiesQuery({
            variables: {
              projectID: scope.projectID,
              probeName: probeName
            }
          });
      }
    }
  }, [type, probeName, infrastructureType]);

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

  return <ChaosProbeConfigurationView loading={loading} probeData={probeData} />;
}
