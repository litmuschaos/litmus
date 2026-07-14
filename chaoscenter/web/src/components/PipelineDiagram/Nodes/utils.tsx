import { Utils } from '@harnessio/uicore';
import type { IconName, IconProps } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import type { CSSProperties } from 'react';
import { ExperimentRunFaultStatus } from '@api/entities';
import { ExecutionPipelineNodeType, ExecutionStatus, ExecutionStatusEnum } from '../types';
import css from './ExecutionStageDiagram.module.scss';

export const getPositionOfAddIcon = (props: any, isRightNode?: boolean): string => {
  if (isRightNode) {
    return '-40px';
  }
  if (props?.children?.length) {
    if (props?.prevNode?.children) {
      return '-65px';
    }
    if (props?.prevNode) return '-58px';
  }
  if (props?.prevNode?.children) {
    return '-58px';
  }
  if (props?.parentIdentifier && !props.prevNode) {
    return '-35px';
  }
  return '-50px';
};

export const getChaosStatusProps = (
  status: ExperimentRunFaultStatus
): {
  secondaryIcon?: IconName;
  secondaryIconProps: Omit<IconProps, 'name'>;
  secondaryIconStyle: CSSProperties;
} => {
  const secondaryIconStyle: React.CSSProperties = { top: -7, right: -7 };
  let secondaryIcon: IconName | undefined = undefined;
  const secondaryIconProps: Omit<IconProps, 'name'> = { size: 16 };
  /* istanbul ignore else */ if (status) {
    switch (status) {
      case ExperimentRunFaultStatus.COMPLETED:
      case ExperimentRunFaultStatus.SUCCEEDED: // <!-- needed for backwards compatibility -->
      case ExperimentRunFaultStatus.PASSED: // <!-- needed for backwards compatibility -->
        secondaryIcon = 'execution-completed';
        secondaryIconStyle.color = 'var(--green-500)';
        secondaryIconProps.size = 18;
        break;
      case ExperimentRunFaultStatus.COMPLETED_WITH_PROBE_FAILURE:
      case ExperimentRunFaultStatus.COMPLETED_WITH_ERROR: // <!-- needed for backwards compatibility -->
        secondaryIcon = 'execution-issue';
        secondaryIconStyle.color = 'var(--orange-500)';
        secondaryIconProps.size = 18;
        break;
      case ExperimentRunFaultStatus.ERROR:
      case ExperimentRunFaultStatus.FAILED: // <!-- needed for backwards compatibility -->
        secondaryIcon = 'execution-error';
        secondaryIconStyle.color = 'var(--red-500)';
        secondaryIconProps.size = 18;
        break;
      case ExperimentRunFaultStatus.RUNNING:
        secondaryIcon = 'execution-running';
        secondaryIconStyle.color = 'var(--primary-7)';
        secondaryIconProps.size = 18;
        break;
      case ExperimentRunFaultStatus.SKIPPED:
        secondaryIcon = 'execution-conditional';
        secondaryIconStyle.color = 'var(--grey-700)';
        secondaryIconProps.size = 18;
        break;
      case ExperimentRunFaultStatus.STOPPED:
        secondaryIcon = 'execution-stopped';
        secondaryIconStyle.color = 'var(--grey-600)';
        secondaryIconProps.size = 18;
        break;
      default:
        break;
    }
  }
  return { secondaryIconStyle, secondaryIcon, secondaryIconProps };
};

export const getStatusProps = (
  status: ExecutionStatus,
  stepType: ExecutionPipelineNodeType
): {
  secondaryIcon?: IconName;
  secondaryIconProps: Omit<IconProps, 'name'>;
  secondaryIconStyle: CSSProperties;
} => {
  const secondaryIconStyle: React.CSSProperties =
    stepType === ExecutionPipelineNodeType.DIAMOND ? {} : { top: -7, right: -7 };
  let secondaryIcon: IconName | undefined = undefined;
  const secondaryIconProps: Omit<IconProps, 'name'> = { size: 16 };
  /* istanbul ignore else */ if (status) {
    switch (status) {
      case ExecutionStatusEnum.IgnoreFailed:
        secondaryIcon = 'warning-outline';
        secondaryIconProps.size = 18;
        secondaryIconStyle.color = 'var(--execution-pipeline-color-dark-red)';
        secondaryIconStyle.animation = `${css.fadeIn} 1s`;
        break;
      case ExecutionStatusEnum.Failed:
        secondaryIcon = 'execution-warning';
        secondaryIconProps.size = 18;
        secondaryIconStyle.color = 'var(--execution-pipeline-color-dark-red)';
        secondaryIconStyle.animation = `${css.fadeIn} 1s`;
        secondaryIconStyle.paddingBottom = `2px`;
        break;
      case ExecutionStatusEnum.ResourceWaiting:
        secondaryIcon = 'execution-warning';
        secondaryIconProps.size = 20;
        secondaryIconStyle.color = 'var(--execution-pipeline-color-orange)';
        secondaryIconStyle.animation = `${css.fadeIn} 1s`;
        break;
      case ExecutionStatusEnum.Success:
        secondaryIcon = 'execution-success';
        secondaryIconProps.color = Color.GREEN_450;
        secondaryIconStyle.animation = `${css.fadeIn} 1s`;
        break;
      case ExecutionStatusEnum.Running:
      case ExecutionStatusEnum.AsyncWaiting:
      case ExecutionStatusEnum.TaskWaiting:
      case ExecutionStatusEnum.TimedWaiting:
        secondaryIcon = 'steps-spinner';
        secondaryIconStyle.animation = `${css.rotate} 2s`;
        secondaryIconStyle.color = Utils.getRealCSSColor(Color.WHITE);
        secondaryIconStyle.backgroundColor = 'var(--primary-7)';
        secondaryIconStyle.borderRadius = '50%';
        secondaryIconStyle.height = '15px';
        secondaryIconStyle.padding = '1px';
        secondaryIconStyle.boxShadow = '0px 0px 0px 0.6px rgba(255,255,255,1)';
        secondaryIconProps.size = 13;
        break;
      case ExecutionStatusEnum.Aborted:
      case ExecutionStatusEnum.Stopped:
        secondaryIcon = 'stop';
        secondaryIconStyle.animation = `${css.fadeIn} 1s`;
        secondaryIconStyle.color = 'var(--grey-700)';
        secondaryIconStyle.backgroundColor = Utils.getRealCSSColor(Color.WHITE);
        secondaryIconStyle.borderRadius = '50%';
        secondaryIconStyle.border = '1px solid var(--grey-700)';
        secondaryIconStyle.height = '16px';
        secondaryIconStyle.padding = '3px';
        secondaryIconStyle.boxShadow = '0px 0px 0px 0.6px rgba(255,255,255,1)';
        secondaryIconProps.size = 8;

        break;
      case ExecutionStatusEnum.Expired:
        secondaryIcon = 'execution-abort';
        secondaryIconStyle.animation = `${css.fadeIn} 1s`;
        secondaryIconStyle.color = 'var(--execution-pipeline-color-dark-grey2)';
        break;
      case ExecutionStatusEnum.Paused:
      case ExecutionStatusEnum.Pausing:
        secondaryIcon = 'execution-input';
        secondaryIconStyle.animation = `${css.fadeIn} 1s`;
        secondaryIconStyle.color = 'var(--execution-pipeline-color-orange)';
        break;
      case ExecutionStatusEnum.ApprovalWaiting:
      case ExecutionStatusEnum.InterventionWaiting:
        secondaryIcon = 'waiting';
        secondaryIconStyle.animation = `${css.fadeIn} 1s`;
        secondaryIconStyle.color = Utils.getRealCSSColor(Color.WHITE);
        secondaryIconStyle.backgroundColor = 'var(--execution-pipeline-color-orange2)';
        secondaryIconStyle.borderRadius = '50%';
        secondaryIconStyle.height = '16px';
        secondaryIconStyle.padding = '2px';
        secondaryIconProps.size = 12;
        secondaryIconStyle.boxShadow = '0px 0px 0px 0.6px rgba(255,255,255,1)';
        break;
      default:
        break;
    }
  }
  return { secondaryIconStyle, secondaryIcon: secondaryIcon, secondaryIconProps };
};
