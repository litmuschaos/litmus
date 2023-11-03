import React from 'react';
import type { Cell, Column } from 'react-table';
import { withErrorBoundary } from 'react-error-boundary';
import { Container } from '@harnessio/uicore';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import { InfrastructureType } from '@api/entities';
import { useSearchParams } from '@hooks';
import HTTPRunProperties from './HTTP/HTTPRunProperties';
import PROMRunProperties from './PROM/PROMRunProperties';
import K8SRunProperties from './K8S/K8SRunProperties';
import CMDRunProperties from './CMD/CMDRunProperties';
import type { KubernetesProbeTableType, ProbePropertiesProps } from '../types';

/*
 * Checks if the prop value is given or not and renders 'N/A' as a fallback
 * Return => string, since TableV1 takes boolean as a property and omits the table value
 * */
export function checkAndReturn(value: { toString: () => string } | null | undefined): string {
  if (value === null) return 'N/A';
  return value?.toString() ?? '';
}

function ProbeProperties({
  kubernetesHTTPProperties,
  promProperties,
  k8sProperties,
  kubernetesCMDProperties
}: ProbePropertiesProps): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;

  const kubernetesColumns: Column<KubernetesProbeTableType>[] = React.useMemo(
    () => [
      {
        Header: `${getString('timeout')}`.toLocaleUpperCase(),
        accessor: 'probeTimeout',
        Cell: (props: Cell<KubernetesProbeTableType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('retry')}`.toLocaleUpperCase(),
        accessor: 'retry',
        Cell: (props: Cell<KubernetesProbeTableType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('attempt')}`.toLocaleUpperCase(),
        accessor: 'attempt',
        Cell: (props: Cell<KubernetesProbeTableType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('interval')}`.toLocaleUpperCase(),
        accessor: 'interval',
        Cell: (props: Cell<KubernetesProbeTableType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('pollingInterval')}`.toLocaleUpperCase(),
        accessor: 'probePollingInterval',
        Cell: (props: Cell<KubernetesProbeTableType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('initialDelay')}`.toLocaleUpperCase(),
        accessor: 'initialDelay',
        Cell: (props: Cell<KubernetesProbeTableType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('evaluationTimeout')}`.toLocaleUpperCase(),
        accessor: 'evaluationTimeout',
        Cell: (props: Cell<KubernetesProbeTableType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('stopOnFailure')}`.toLocaleUpperCase(),
        accessor: 'stopOnFailure',
        Cell: (props: Cell<KubernetesProbeTableType>) => checkAndReturn(props.value)
      }
    ],
    []
  );

  function chooseRender(): React.ReactElement {
    if (infrastructureType === InfrastructureType.KUBERNETES) {
      if (kubernetesHTTPProperties)
        return (
          <HTTPRunProperties
            columns={kubernetesColumns as Column<KubernetesProbeTableType>[]}
            kubernetesHTTPProperties={kubernetesHTTPProperties}
          />
        );
      else if (promProperties) return <PROMRunProperties columns={kubernetesColumns} promProperties={promProperties} />;
      else if (k8sProperties) return <K8SRunProperties columns={kubernetesColumns} k8sProperties={k8sProperties} />;
      else if (kubernetesCMDProperties)
        return (
          <CMDRunProperties
            columns={kubernetesColumns as Column<KubernetesProbeTableType>[]}
            kubernetesCMDProperties={kubernetesCMDProperties}
          />
        );
    }
    // TODO: Update to a better fallback Table
    return <Container width={'100%'}>{getString(`unableToGetProbes`)}</Container>;
  }

  return chooseRender();
}

export default withErrorBoundary(ProbeProperties, { FallbackComponent: Fallback });
