import React from 'react';
import { TableV2 } from '@harnessio/uicore';
import { withErrorBoundary } from 'react-error-boundary';
import type { Cell, Column } from 'react-table';
import classnames from 'classnames';
import { Fallback } from '@errors';
import type { ComparatorInfo } from '@models';
import type { CMDProbeDetailsType, ProbePropertiesProps } from '@views/ChaosProbeConfiguration';
import { useStrings } from '@strings';
import { InfrastructureType } from '@api/entities';
import { useSearchParams } from '@hooks';
import { checkAndReturn } from '../ProbeProperties';
import css from '../../ChaosProbeConfiguration.module.scss';

function CMDProbeDetails({
  kubernetesCMDProperties
}: Pick<ProbePropertiesProps, 'kubernetesCMDProperties'>): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;

  const columns: Column<CMDProbeDetailsType>[] = React.useMemo(
    () => [
      {
        Header: `${getString('command')}`.toLocaleUpperCase(),
        accessor: 'command',
        Cell: (props: Cell<CMDProbeDetailsType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('source')}`.toLocaleUpperCase(),
        accessor: 'source',
        Cell: (props: Cell<CMDProbeDetailsType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('comparator')}`.toLocaleUpperCase(),
        accessor: 'comparator',
        Cell: (props: Cell<CMDProbeDetailsType>) => checkAndReturn(props.value)
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const probeDetails: CMDProbeDetailsType[] =
    infrastructureType === InfrastructureType.KUBERNETES
      ? [
          {
            command: kubernetesCMDProperties?.command ?? '',
            source: kubernetesCMDProperties?.source,
            comparator: kubernetesCMDProperties?.comparator ?? ({} as ComparatorInfo)
          }
        ]
      : [];

  return <TableV2 columns={columns} data={probeDetails} className={classnames(css.table, css.cmdDetails)} minimal />;
}

export default withErrorBoundary(CMDProbeDetails, { FallbackComponent: Fallback });
