import React from 'react';
import { TableV2, Text } from '@harnessio/uicore';
import { withErrorBoundary } from 'react-error-boundary';
import type { Cell, Column } from 'react-table';
import classnames from 'classnames';
import { Fallback } from '@errors';
import type { K8sProbeInputs } from '@models';
import type { ProbePropertiesProps } from '@views/ChaosProbeConfiguration';
import { useStrings } from '@strings';
import { checkAndReturn } from '../ProbeProperties';
import css from '../../ChaosProbeConfiguration.module.scss';

function K8SProbeDetails({ k8sProperties }: Pick<ProbePropertiesProps, 'k8sProperties'>): React.ReactElement {
  const { getString } = useStrings();

  const columns: Column<K8sProbeInputs>[] = React.useMemo(
    () => [
      {
        Header: `${getString('group')}`.toLocaleUpperCase(),
        accessor: 'group',
        Cell: (props: Cell<K8sProbeInputs>) => <Text lineClamp={1}>{checkAndReturn(props.value)}</Text>
      },
      {
        Header: `${getString('version')}`.toLocaleUpperCase(),
        accessor: 'version',
        Cell: (props: Cell<K8sProbeInputs>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('resource')}`.toLocaleUpperCase(),
        accessor: 'resource',
        Cell: (props: Cell<K8sProbeInputs>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('namespace')}`.toLocaleUpperCase(),
        accessor: 'namespace',
        Cell: (props: Cell<K8sProbeInputs>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('resourceNames')}`.toLocaleUpperCase(),
        accessor: 'resourceNames',
        Cell: (props: Cell<K8sProbeInputs>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('fieldSelector')}`.toLocaleUpperCase(),
        accessor: 'fieldSelector',
        Cell: (props: Cell<K8sProbeInputs>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('labelSelector')}`.toLocaleUpperCase(),
        accessor: 'labelSelector',
        Cell: (props: Cell<K8sProbeInputs>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('operation')}`.toLocaleUpperCase(),
        accessor: 'operation',
        Cell: (props: Cell<K8sProbeInputs>) => checkAndReturn(props.value)
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const probeDetails: K8sProbeInputs[] = [
    {
      group: k8sProperties?.group,
      version: k8sProperties?.version as string,
      resource: k8sProperties?.resource as string,
      namespace: k8sProperties?.namespace,
      resourceNames: k8sProperties?.resourceNames,
      fieldSelector: k8sProperties?.fieldSelector,
      labelSelector: k8sProperties?.labelSelector,
      operation: k8sProperties?.operation as string
    }
  ];

  return <TableV2 columns={columns} data={probeDetails} className={classnames(css.table, css.k8SDetails)} minimal />;
}

export default withErrorBoundary(K8SProbeDetails, { FallbackComponent: Fallback });
