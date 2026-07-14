import React from 'react';
import { TableV2 } from '@harnessio/uicore';
import { withErrorBoundary } from 'react-error-boundary';
import classnames from 'classnames';
import type { Column } from 'react-table';
import type { RunProperty } from '@models';
import { Fallback } from '@errors';
import type { ProbePropertiesProps } from '@views/ChaosProbeConfiguration';
import css from '../../ChaosProbeConfiguration.module.scss';

interface PROMRunPropertiesProps extends ProbePropertiesProps {
  columns: Column<RunProperty>[];
}

function PROMRunProperties({ promProperties, columns }: PROMRunPropertiesProps): React.ReactElement {
  const runProperties: RunProperty[] = [{ ...promProperties }];

  return <TableV2 columns={columns} data={runProperties} className={classnames(css.table, css.properties)} minimal />;
}

export default withErrorBoundary(PROMRunProperties, { FallbackComponent: Fallback });
