import React from 'react';
import { TableV2, Text } from '@harnessio/uicore';
import { withErrorBoundary } from 'react-error-boundary';
import type { Cell, Column } from 'react-table';
import classnames from 'classnames';
import { Fallback } from '@errors';
import type { ProbePropertiesProps, PROMProbeDetailsType } from '@views/ChaosProbeConfiguration';
import { useStrings } from '@strings';
import { checkAndReturn } from '../ProbeProperties';
import css from '../../ChaosProbeConfiguration.module.scss';

function PROMProbeDetails({ promProperties }: Pick<ProbePropertiesProps, 'promProperties'>): React.ReactElement {
  const { getString } = useStrings();
  const columns: Column<PROMProbeDetailsType>[] = React.useMemo(
    () => [
      {
        Header: `${getString('endpoint')}`.toLocaleUpperCase(),
        accessor: 'endpoint',
        Cell: (props: Cell<PROMProbeDetailsType>) => <Text lineClamp={1}>{checkAndReturn(props.value)}</Text>
      },
      {
        Header: `${getString('query')}`.toLocaleUpperCase(),
        accessor: 'query',
        Cell: (props: Cell<PROMProbeDetailsType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('queryPath')}`.toLocaleUpperCase(),
        accessor: 'queryPath',
        Cell: (props: Cell<PROMProbeDetailsType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('criteria')}`.toLocaleUpperCase(),
        accessor: 'criteria',
        Cell: (props: Cell<PROMProbeDetailsType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('value')}`.toLocaleUpperCase(),
        accessor: 'value',
        Cell: (props: Cell<PROMProbeDetailsType>) => checkAndReturn(props.value)
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const probeDetails: PROMProbeDetailsType[] = [
    {
      endpoint: promProperties?.endpoint,
      query: promProperties?.query,
      queryPath: promProperties?.queryPath,
      criteria: promProperties?.comparator?.criteria,
      value: promProperties?.comparator?.value
    }
  ];

  return <TableV2 columns={columns} data={probeDetails} className={classnames(css.table, css.promDetails)} minimal />;
}

export default withErrorBoundary(PROMProbeDetails, { FallbackComponent: Fallback });
