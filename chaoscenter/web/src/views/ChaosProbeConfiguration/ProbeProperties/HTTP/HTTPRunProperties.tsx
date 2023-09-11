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

interface HTTPRunPropertiesProps extends ProbePropertiesProps {
  columns: Column<KubernetesProbeTableType>[];
}

function HTTPRunProperties({ kubernetesHTTPProperties, columns }: HTTPRunPropertiesProps): React.ReactElement {
  const searchParams = useSearchParams();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;
  const runProperties: KubernetesProbeTableType[] =
    infrastructureType === InfrastructureType.KUBERNETES
      ? [
          {
            probeTimeout: kubernetesHTTPProperties?.probeTimeout,
            retry: kubernetesHTTPProperties?.retry,
            attempt: kubernetesHTTPProperties?.attempt as number,
            interval: kubernetesHTTPProperties?.interval,
            probePollingInterval: kubernetesHTTPProperties?.probePollingInterval,
            initialDelay: kubernetesHTTPProperties?.initialDelay,
            evaluationTimeout: kubernetesHTTPProperties?.evaluationTimeout as string,
            stopOnFailure: kubernetesHTTPProperties?.stopOnFailure
          } as KubernetesProbeTableType
        ]
      : [];

  return <TableV2 columns={columns} data={runProperties} className={classnames(css.table, css.properties)} minimal />;
}

export default withErrorBoundary(HTTPRunProperties, { FallbackComponent: Fallback });
