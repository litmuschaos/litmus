import React from 'react';
import { TableV2 } from '@harnessio/uicore';
import { withErrorBoundary } from 'react-error-boundary';
import classnames from 'classnames';
import type { Column } from 'react-table';
import { Fallback } from '@errors';
import type { KubernetesProbeTableType, ProbePropertiesProps } from '@views/ChaosProbeConfiguration';
import { InfrastructureType } from '@api/entities';
import { useSearchParams } from '@hooks';
import css from '../../ChaosProbeConfiguration.module.scss';

interface CMDRunPropertiesProps extends ProbePropertiesProps {
  columns: Column<KubernetesProbeTableType>[];
}

function CMDRunProperties({ kubernetesCMDProperties, columns }: CMDRunPropertiesProps): React.ReactElement {
  const searchParams = useSearchParams();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;
  const runProperties: KubernetesProbeTableType[] =
    infrastructureType === InfrastructureType.KUBERNETES
      ? [
          {
            probeTimeout: kubernetesCMDProperties?.probeTimeout,
            retry: kubernetesCMDProperties?.retry,
            attempt: kubernetesCMDProperties?.attempt as number,
            interval: kubernetesCMDProperties?.interval,
            probePollingInterval: kubernetesCMDProperties?.probePollingInterval,
            initialDelay: kubernetesCMDProperties?.initialDelay,
            evaluationTimeout: kubernetesCMDProperties?.evaluationTimeout as string,
            stopOnFailure: kubernetesCMDProperties?.stopOnFailure
          }
        ]
      : [];

  return <TableV2 columns={columns} data={runProperties} className={classnames(css.table, css.properties)} minimal />;
}

export default withErrorBoundary(CMDRunProperties, { FallbackComponent: Fallback });
