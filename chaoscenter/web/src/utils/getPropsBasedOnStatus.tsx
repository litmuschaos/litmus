import { Color } from '@harnessio/design-system';
import { ChaosInfrastructureStatus, PermissionGroup } from '@models';
import type { Status, StatusProps } from '@components/StatusBadgeV2';
import { ExperimentRunFaultStatus, ExperimentRunStatus, FaultProbeStatus } from '@api/entities';

export function getPropsBasedOnChaosInfrastructureStatus(status: Status): StatusProps {
  switch (status) {
    case ChaosInfrastructureStatus.ACTIVE:
      return {
        color: Color.GREEN_800,
        bgColor: `var(--green-50)`
      };
    case ChaosInfrastructureStatus.PENDING:
      return {
        iconName: 'loading',
        color: Color.PRIMARY_7,
        bgColor: `var(--primary-1)`
      };
    case ChaosInfrastructureStatus.INACTIVE:
      return {
        color: Color.RED_600,
        bgColor: `var(--red-50)`
      };
    case ChaosInfrastructureStatus.UPGRADE_NEEDED:
      return {
        iconName: 'flash',
        iconSize: 15,
        color: Color.ORANGE_700,
        bgColor: `var(--orange-50)`
      };
    default:
      return {
        color: Color.GREY_700,
        bgColor: `var(--grey-200)`
      };
  }
}

export function getPropsBasedOnExperimentRunFaultStatus(status: Status): StatusProps {
  switch (status) {
    case ExperimentRunFaultStatus.COMPLETED:
    case ExperimentRunFaultStatus.SUCCEEDED: // <!-- needed for backwards compatibility -->
    case ExperimentRunFaultStatus.PASSED: // <!-- needed for backwards compatibility -->
      return {
        iconName: 'tick-circle',
        color: Color.GREEN_800
      };
    case ExperimentRunFaultStatus.COMPLETED_WITH_PROBE_FAILURE:
    case ExperimentRunFaultStatus.COMPLETED_WITH_ERROR: // <!-- needed for backwards compatibility -->
      return {
        iconName: 'error',
        color: Color.ORANGE_500
      };
    case ExperimentRunFaultStatus.ERROR:
    case ExperimentRunFaultStatus.FAILED: // <!-- needed for backwards compatibility -->
      return {
        iconName: 'circle-cross',
        color: Color.RED_600
      };
    case ExperimentRunFaultStatus.RUNNING:
      return {
        iconName: 'running-filled',
        iconSize: 11,
        color: Color.PRIMARY_7
      };
    case ExperimentRunFaultStatus.STOPPED:
      return {
        iconName: 'circle-stop',
        color: Color.GREY_700
      };
    case ExperimentRunFaultStatus.SKIPPED:
      return {
        iconName: 'conditional-filled',
        color: Color.GREY_700
      };
    default:
      return {
        iconName: 'disable',
        iconSize: 10,
        color: Color.GREY_700
      };
  }
}

export function getPropsBasedOnExperimentRunStatus(status: Status): StatusProps {
  switch (status) {
    case ExperimentRunStatus.COMPLETED:
      return {
        iconName: 'tick-circle',
        color: Color.GREEN_800,
        bgColor: `var(--green-50)`
      };
    case ExperimentRunStatus.COMPLETED_WITH_PROBE_FAILURE:
    case ExperimentRunStatus.COMPLETED_WITH_ERROR: // <!-- needed for backwards compatibility -->
      return {
        iconName: 'error',
        color: Color.ORANGE_500,
        bgColor: `var(--orange-100)`
      };
    case ExperimentRunStatus.ERROR:
      return {
        iconName: 'circle-cross',
        color: Color.RED_600,
        bgColor: `var(--red-50)`
      };
    case ExperimentRunStatus.TIMEOUT:
      return {
        iconName: 'time',
        color: Color.RED_600,
        bgColor: `var(--red-50)`
      };
    case ExperimentRunStatus.RUNNING:
      return {
        iconName: 'loading',
        color: Color.GREY_0,
        bgColor: `var(--primary-7)`
      };

    case ExperimentRunStatus.QUEUED:
      return {
        iconName: 'pause',
        color: Color.PRIMARY_5,
        bgColor: `var(--primary-2)`
      };
    case ExperimentRunStatus.STOPPED:
      return {
        iconName: 'circle-stop',
        color: Color.GREY_700,
        bgColor: `var(--grey-200)`
      };
    default:
      return {
        iconName: 'disable',
        iconSize: 10,
        color: Color.GREY_700,
        bgColor: `var(--grey-200)`
      };
  }
}

export function getPropsBasedOnProbeStatus(status: Status): StatusProps {
  switch (status) {
    case FaultProbeStatus.PASSED:
      return {
        color: Color.GREEN_700,
        iconName: 'execution-success',
        iconSize: 14,
        bgColor: `var(--green-50)`
      };
    case FaultProbeStatus.FAILED:
      return {
        color: Color.RED_700,
        iconName: 'execution-warning',
        iconSize: 14,
        bgColor: `var(--red-50)`
      };
    case FaultProbeStatus.AWAITED:
      return {
        color: Color.YELLOW_700,
        iconSize: 14,
        iconColor: 'execution-waiting',
        bgColor: `var(--yellow-100)`
      };
    default:
      return {
        color: Color.GREY_700,
        bgColor: `var(--grey-200)`
      };
  }
}

export function getPropsBasedOnPermissionGroup(status: Status): StatusProps {
  switch (status) {
    case PermissionGroup.OWNER:
      return {
        color: Color.GREEN_800,
        bgColor: `var(--green-50)`
      };
    case PermissionGroup.EDITOR:
      return {
        color: Color.ORANGE_700,
        bgColor: `var(--orange-50)`
      };
    case PermissionGroup.VIEWER:
      return {
        color: Color.GREY_700,
        bgColor: `var(--grey-200)`
      };
    default:
      return {
        color: Color.GREY_700,
        bgColor: `var(--grey-200)`
      };
  }
}
