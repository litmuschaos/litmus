import React from 'react';
import cx from 'classnames';
import { Icon } from '@harnessio/icons';
import type { IconProps } from '@harnessio/icons';

import type { ExecutionStatus } from '../types';

import css from './ExecutionStatusLabel.module.scss';

export const stringsMap: Record<ExecutionStatus, string> = {
  Aborted: 'Aborted',
  Discontinuing: 'Aborted',
  Running: 'Running',
  AsyncWaiting: 'Running',
  TaskWaiting: 'Running',
  TimedWaiting: 'Running',
  Failed: 'Failed',
  Stopped: 'Stopped',
  Errored: 'Failed',
  NotStarted: 'NotStarted',
  Expired: 'Expired',
  Queued: 'Queued',
  Paused: 'Paused',
  ResourceWaiting: 'Waiting',
  Skipped: 'Skipped',
  Success: 'Success',
  IgnoreFailed: 'Success',
  Suspended: 'Suspended',
  Pausing: 'Pausing',
  ApprovalRejected: 'ApprovalRejected',
  InterventionWaiting: 'Waiting',
  ApprovalWaiting: 'Waiting',
  Waiting: 'Waiting'
};

export const iconMap: Record<ExecutionStatus, IconProps> = {
  Success: { name: 'tick-circle', size: 9 },
  IgnoreFailed: { name: 'tick-circle', size: 9 },
  Paused: { name: 'pause', size: 12 },
  Pausing: { name: 'pause', size: 12 },
  Failed: { name: 'warning-sign', size: 9 },
  Errored: { name: 'warning-sign', size: 9 },
  InterventionWaiting: { name: 'time', size: 9 },
  ResourceWaiting: { name: 'time', size: 9 },
  ApprovalWaiting: { name: 'time', size: 9 },
  AsyncWaiting: { name: 'loading', size: 10 },
  TaskWaiting: { name: 'loading', size: 10 },
  TimedWaiting: { name: 'loading', size: 10 },
  Running: { name: 'loading', size: 10 },
  Aborted: { name: 'circle-stop', size: 9 },
  Discontinuing: { name: 'circle-stop', size: 9 },
  Stopped: { name: 'circle-stop', size: 9 },
  Expired: { name: 'expired', size: 9 },
  Suspended: { name: 'banned', size: 9 },
  ApprovalRejected: { name: 'x', size: 8 },
  Queued: { name: 'queued', size: 10 },
  NotStarted: { name: 'play-outline', size: 8 },
  Skipped: { name: 'skipped', size: 8 },
  Waiting: { name: 'loading', size: 10 }
};

export interface ExecutionStatusLabelProps {
  status?: ExecutionStatus;
  className?: string;
  label?: string;
}

export default function ExecutionStatusLabel({
  status,
  className,
  label
}: ExecutionStatusLabelProps): React.ReactElement | null {
  if (!status) return null;

  return (
    <div className={cx(css.status, css[status.toLowerCase() as keyof typeof css], className)}>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      {iconMap[status] ? <Icon {...iconMap[status]} className={css.icon} /> : null}
      {label ? label : stringsMap[status] || 'Unknown'}
    </div>
  );
}
