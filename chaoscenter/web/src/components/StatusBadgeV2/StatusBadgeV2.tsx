import React from 'react';
import { Color } from '@harnessio/design-system';
import { Container, Text, Utils } from '@harnessio/uicore';
import { Icon, IconName } from '@harnessio/icons';
import type { ExperimentRunFaultStatus, ExperimentRunStatus, FaultProbeStatus } from '@api/entities';
import type { ChaosInfrastructureStatus, PermissionGroup } from '@models';
import {
  getPropsBasedOnChaosInfrastructureStatus,
  getPropsBasedOnExperimentRunFaultStatus,
  getPropsBasedOnExperimentRunStatus,
  getPropsBasedOnPermissionGroup,
  getPropsBasedOnProbeStatus,
  phaseToUI
} from '@utils';

export type Status =
  | ExperimentRunStatus
  | ExperimentRunFaultStatus
  | FaultProbeStatus
  | ChaosInfrastructureStatus
  | PermissionGroup;

export enum StatusBadgeEntity {
  ExperimentRun = 'ExperimentRun',
  ExperimentRunFault = 'ExperimentRunFault',
  Probe = 'Probe',
  Infrastructure = 'Infrastructure',
  PermissionGroup = 'PermissionGroup'
}

interface StatusBadgeV2Props {
  status: Status;
  entity: StatusBadgeEntity;
  tooltip?: string | JSX.Element | undefined;
}

export interface StatusProps {
  color: Color;
  bgColor?: string;
  iconName?: IconName;
  iconSize?: number;
  iconColor?: Color;
  useSquareBox?: boolean; // New prop for square box icon styling
}

export function StatusBadgeV2({ status, entity, tooltip }: StatusBadgeV2Props): React.ReactElement {
  const {
    color,
    bgColor,
    iconName,
    iconSize = 11,
    iconColor,
    useSquareBox = false // Default to false for backward compatibility
  } = (() => {
    switch (entity) {
      case StatusBadgeEntity.ExperimentRun:
        return getPropsBasedOnExperimentRunStatus(status);
      case StatusBadgeEntity.ExperimentRunFault:
        return getPropsBasedOnExperimentRunFaultStatus(status);
      case StatusBadgeEntity.Probe:
        return getPropsBasedOnProbeStatus(status);
      case StatusBadgeEntity.Infrastructure:
        return getPropsBasedOnChaosInfrastructureStatus(status);
      case StatusBadgeEntity.PermissionGroup:
        return getPropsBasedOnPermissionGroup(status);
      default:
        return {
          color: Color.GREY_700
        } as StatusProps;
    }
  })();

  return (
    <Container
      data-testid={'status-badge-v2'}
      width={'fit-content'}
      flex={{ align: 'center-center' }}
      style={{ borderRadius: 4, padding: '5px 8px', backgroundColor: bgColor }}
    >
      {iconName && useSquareBox ? (
        // Render icon inside a square box for partially completed experiments
        <Container
          flex={{ align: 'center-center', justifyContent: 'center' }}
          style={{
            width: 16,
            height: 16,
            border: `1.5px solid ${Utils.getRealCSSColor(color)}`,
            borderRadius: 2,
            marginRight: 6
          }}
        >
          <Icon name={iconName} width={10} style={{ color: Utils.getRealCSSColor(iconColor ?? color) }} size={8} />
        </Container>
      ) : iconName ? (
        // Standard icon rendering
        <Icon name={iconName} width={12} style={{ color: Utils.getRealCSSColor(iconColor ?? color) }} size={iconSize} />
      ) : null}
      <Text
        margin={{ left: iconName ? 'xsmall' : 0 }}
        style={{ letterSpacing: '0.1px', fontSize: 12, whiteSpace: 'nowrap' }}
        tooltip={tooltip}
        tooltipProps={{
          isDark: true
        }}
        font={{ weight: 'bold' }}
        color={color}
      >
        {phaseToUI(status)}
      </Text>
    </Container>
  );
}

export default StatusBadgeV2;
