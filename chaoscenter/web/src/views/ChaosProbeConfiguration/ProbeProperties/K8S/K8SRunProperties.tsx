import React from 'react';
import { TableV2 } from '@harnessio/uicore';
import { withErrorBoundary } from 'react-error-boundary';
import classnames from 'classnames';
import type { Column } from 'react-table';
import type { RunProperty } from '@models';
import { Fallback } from '@errors';
import type { ProbePropertiesProps } from '@views/ChaosProbeConfiguration';
import css from '../../ChaosProbeConfiguration.module.scss';

interface K8SRunPropertiesProps extends ProbePropertiesProps {
  columns: Column<RunProperty>[];
}

function K8SRunProperties({ k8sProperties, columns }: K8SRunPropertiesProps): React.ReactElement {
  const runProperties: RunProperty[] = [{ ...k8sProperties }];

  return <TableV2 columns={columns} data={runProperties} className={classnames(css.table, css.properties)} minimal />;
}

export default withErrorBoundary(K8SRunProperties, { FallbackComponent: Fallback });
