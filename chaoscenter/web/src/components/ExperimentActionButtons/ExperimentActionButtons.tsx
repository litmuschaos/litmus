import React from 'react';
import { Color, PopoverProps } from '@harnessio/design-system';
import {
  useToaster,
  ButtonVariation,
  ButtonProps,
  ConfirmationDialog,
  ConfirmationDialogProps,
  useToggleOpen
} from '@harnessio/uicore';
import cx from 'classnames';
import { Intent, Position } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';
import { parse } from 'yaml';
import { useStrings } from '@strings';
import {
  listExperiment,
  runChaosExperiment,
  stopExperiment,
  stopExperimentRun,
  useUpdateCronExperimentStateMutation
} from '@api/core';
import { useRouteWithBaseUrl } from '@hooks';
import type { RefetchExperimentRuns, RefetchExperiments } from '@controllers/ExperimentDashboardV2';
import { PermissionGroup, StudioTabs } from '@models';
import RbacButton from '@components/RbacButton';
import { downloadYamlAsFile, getScope, yamlStringify } from '@utils';
import type { InfrastructureType } from '@api/entities';
import css from './ExperimentActionButton.module.scss';

interface ActionButtonProps {
  experimentID: string;
  tooltipProps?: PopoverProps;
}

interface RunExperimentButtonProps extends ActionButtonProps, Partial<RefetchExperiments> {
  buttonProps?: ButtonProps;
  disabled?: boolean;
}

interface StopExperimentButtonProps extends ActionButtonProps, Partial<RefetchExperiments> {
  buttonProps?: ButtonProps;
  infrastructureType: InfrastructureType | undefined;
  disabled?: boolean;
}

export const RunExperimentButton = ({
  experimentID,
  tooltipProps,
  buttonProps,
  refetchExperiments,
  disabled
}: RunExperimentButtonProps): React.ReactElement => {
  const scope = getScope();
  const { getString } = useStrings();
  const { showSuccess, showError } = useToaster();
  const paths = useRouteWithBaseUrl();
  const history = useHistory();
  const [runChaosExperimentMutation] = runChaosExperiment({
    onCompleted: response => {
      showSuccess(getString('reRunSuccessful'));
      refetchExperiments?.();
      const notifyID = response.runChaosExperiment.notifyID;
      if (notifyID !== '') {
        history.push(
          paths.toExperimentRunDetailsViaNotifyID({
            experimentID: experimentID,
            notifyID: response.runChaosExperiment.notifyID
          })
        );
      }
    },
    onError: err => {
      showError(err.message);
    }
  });
  return (
    <div className={cx(css.actionButtons, css.withBg, css.hoverGreen)}>
      <RbacButton
        tooltip={getString('reRunExperiment')}
        tooltipProps={{
          position: Position.TOP,
          usePortal: true,
          isDark: true,
          ...tooltipProps
        }}
        disabled={disabled}
        iconProps={{ size: 18 }}
        icon={'play'}
        withoutCurrentColor
        variation={ButtonVariation.ICON}
        permission={PermissionGroup.EDITOR}
        onClick={() => {
          runChaosExperimentMutation({
            variables: { projectID: scope.projectID, experimentID: experimentID }
          });
        }}
        {...buttonProps}
      />
    </div>
  );
};

export const StopExperimentButton = ({
  experimentID,
  tooltipProps,
  refetchExperiments,
  disabled
}: StopExperimentButtonProps): React.ReactElement => {
  const scope = getScope();
  const { getString } = useStrings();
  const { showSuccess, showError } = useToaster();
  const {
    isOpen: isOpenStopExperimentDialog,
    open: openStopExperimentDialog,
    close: closeStopExperimentDialog
  } = useToggleOpen();

  const [stopExperimentMutation] = stopExperiment({
    onCompleted: () => {
      showSuccess(getString('experimentStopSuccessMessage'));
      refetchExperiments?.();
    },
    onError: err => showError(err.message)
  });

  const stopExperimentDialogProps: ConfirmationDialogProps = {
    isOpen: isOpenStopExperimentDialog,
    contentText: getString('stopExperimentDesc'),
    titleText: getString('stopExperimentHeading'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onClose: (isConfirmed: boolean) => {
      if (isConfirmed) {
        stopExperimentMutation({
          variables: {
            projectID: scope.projectID,
            experimentID
          }
        });
      }
      closeStopExperimentDialog();
    }
  };

  const stopExperimentDialog = <ConfirmationDialog {...stopExperimentDialogProps} />;

  return (
    <div className={cx(css.actionButtons, css.withBg, css.hoverRed)}>
      <div>
        <RbacButton
          tooltip={getString('stopExpRuns')}
          iconProps={{ size: 18 }}
          withoutCurrentColor
          disabled={disabled}
          tooltipProps={{
            position: Position.TOP,
            usePortal: true,
            isDark: true,
            ...tooltipProps
          }}
          permission={PermissionGroup.EDITOR}
          variation={ButtonVariation.ICON}
          icon={'stop'}
          onClick={openStopExperimentDialog}
        />
      </div>
      {stopExperimentDialog}
    </div>
  );
};

interface StopExperimentRunButtonProps extends ActionButtonProps, Partial<RefetchExperimentRuns> {
  experimentRunID?: string;
  notifyID?: string;
  infrastructureType: InfrastructureType | undefined;
}

export const StopExperimentRunButton = ({
  experimentID,
  experimentRunID,
  tooltipProps,
  refetchExperimentRuns
}: StopExperimentRunButtonProps): React.ReactElement => {
  const scope = getScope();
  const { getString } = useStrings();
  const { showSuccess, showError } = useToaster();
  const {
    isOpen: isOpenStopExperimentRunModal,
    open: openStopExperimentRunDialog,
    close: closeStopExperimentRunDialog
  } = useToggleOpen();

  const [stopExperimentRunMutation] = stopExperimentRun({
    onCompleted: () => {
      showSuccess(getString('experimentStopSuccessMessage'));
      refetchExperimentRuns?.();
    },
    onError: err => showError(err.message)
  });

  const stopExperimentRunDialogProps: ConfirmationDialogProps = {
    isOpen: isOpenStopExperimentRunModal,
    contentText: getString('stopExpRunDesc'),
    titleText: `${getString('stopExpRun')}?`,
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onClose: (isConfirmed: boolean) => {
      if (isConfirmed) {
        stopExperimentRunMutation({
          variables: {
            experimentID,
            projectID: scope.projectID,
            experimentRunID
          }
        });
      }
      closeStopExperimentRunDialog();
    }
  };

  const stopExperimentRunDialog = <ConfirmationDialog {...stopExperimentRunDialogProps} />;

  return (
    <div className={cx(css.actionButtons, css.withBg, css.hoverRed)}>
      <div>
        <RbacButton
          tooltip={getString('stopExpRun')}
          iconProps={{ size: 18 }}
          withoutCurrentColor
          tooltipProps={{
            position: Position.TOP,
            usePortal: true,
            isDark: true,
            ...tooltipProps
          }}
          variation={ButtonVariation.ICON}
          icon={'stop'}
          permission={PermissionGroup.EDITOR}
          onClick={openStopExperimentRunDialog}
        />
      </div>
      {stopExperimentRunDialog}
    </div>
  );
};

export const EditExperimentButton = ({ experimentID, tooltipProps }: ActionButtonProps): React.ReactElement => {
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  return (
    <div className={cx(css.actionButtons)}>
      <RbacButton
        tooltipProps={{
          position: Position.TOP,
          usePortal: true,
          isDark: true,
          ...tooltipProps
        }}
        iconProps={{ size: 18, color: Color.PRIMARY_6 }}
        withoutCurrentColor
        variation={ButtonVariation.ICON}
        icon={'Edit'}
        onClick={() => {
          history.push({
            pathname: paths.toEditExperiment({ experimentKey: experimentID }),
            search: `tab=${StudioTabs.BUILDER}`
          });
        }}
        permission={PermissionGroup.EDITOR}
      />
    </div>
  );
};

export const CloneExperimentButton = ({ experimentID, tooltipProps }: ActionButtonProps): React.ReactElement => {
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  return (
    <div className={cx(css.actionButtons, css.cloneButton)}>
      <RbacButton
        tooltipProps={{
          position: Position.TOP,
          usePortal: true,
          isDark: true,
          ...tooltipProps
        }}
        iconProps={{ size: 18 }}
        variation={ButtonVariation.ICON}
        icon={'copy-alt'}
        onClick={() => {
          history.push({
            pathname: paths.toCloneExperiment({ experimentKey: experimentID })
          });
        }}
        permission={PermissionGroup.EDITOR}
      />
    </div>
  );
};

interface DownloadExperimentButtonProps extends ActionButtonProps {
  name?: string;
  manifest?: string;
}

export const DownloadExperimentButton = ({
  experimentID,
  name,
  manifest,
  tooltipProps
}: DownloadExperimentButtonProps): React.ReactElement => {
  const [experimentManifest, setExperimentManifest] = React.useState<string | undefined>(manifest);
  const [fileName, setFileName] = React.useState<string | undefined>(name);
  const { showError } = useToaster();
  const { getString } = useStrings();
  const scope = getScope();

  const { loading } = listExperiment({
    ...scope,
    experimentIDs: [experimentID],
    options: {
      skip: experimentID === undefined || manifest !== undefined,
      fetchPolicy: 'cache-first',
      onCompleted: data => {
        setExperimentManifest(data.listExperiment?.experiments?.[0]?.experimentManifest);
        setFileName(data.listExperiment?.experiments?.[0]?.name);
      }
    }
  });

  return (
    <div className={cx(css.actionButtons)}>
      <RbacButton
        tooltipProps={{
          position: Position.TOP,
          usePortal: true,
          isDark: true,
          ...tooltipProps
        }}
        disabled={loading}
        iconProps={{ size: 18, color: Color.PRIMARY_6 }}
        withoutCurrentColor
        onClick={() => {
          experimentManifest
            ? downloadYamlAsFile(yamlStringify(parse(experimentManifest)), `${fileName}.yml`)
            : showError(getString('manifestDownloadUnsuccessful'));
        }}
        variation={ButtonVariation.ICON}
        icon={'import'}
        permission={PermissionGroup.VIEWER}
      />
    </div>
  );
};

interface EnableDisableCronButtonProps extends ActionButtonProps, Partial<RefetchExperiments> {
  isCronEnabled: boolean;
}

export const EnableDisableCronButton = ({
  experimentID,
  tooltipProps,
  isCronEnabled,
  refetchExperiments
}: EnableDisableCronButtonProps): React.ReactElement => {
  const scope = getScope();
  const { getString } = useStrings();
  const { showSuccess, showError } = useToaster();
  const {
    isOpen: isOpenCronEnableDisableDialog,
    open: openCronEnableDisableDialog,
    close: closeCronEnableDisableDialog
  } = useToggleOpen();

  const [updateCronExperimentStateMutation] = useUpdateCronExperimentStateMutation({
    onCompleted: () => {
      showSuccess(isCronEnabled ? getString('cronHalted') : getString('cronResumed'));
      refetchExperiments?.();
    },
    onError: err => showError(err.message)
  });

  const cronEnableDisableDialogProps: ConfirmationDialogProps = {
    isOpen: isOpenCronEnableDisableDialog,
    contentText: isCronEnabled ? getString('disableCronDesc') : getString('enableCronDesc'),
    titleText: isCronEnabled ? `${getString('disableCron')}?` : `${getString('enableCron')}?`,
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onClose: (isConfirmed: boolean) => {
      if (isConfirmed) {
        updateCronExperimentStateMutation({
          variables: {
            projectID: scope.projectID,
            experimentID: experimentID,
            disable: isCronEnabled ? true : false
          }
        });
      }
      closeCronEnableDisableDialog();
    }
  };

  const cronEnableDisableDialog = <ConfirmationDialog {...cronEnableDisableDialogProps} />;

  return (
    <div className={cx(css.actionButtons, css.withBg)}>
      <div>
        <RbacButton
          tooltip={isCronEnabled ? getString('disableCron') : getString('enableCron')}
          iconProps={{ size: 18 }}
          withoutCurrentColor
          intent={isCronEnabled ? 'danger' : 'success'}
          tooltipProps={{
            position: Position.TOP,
            usePortal: true,
            isDark: true,
            ...tooltipProps
          }}
          variation={ButtonVariation.ICON}
          icon={'time'}
          onClick={openCronEnableDisableDialog}
          permission={PermissionGroup.EDITOR}
        />
      </div>
      {cronEnableDisableDialog}
    </div>
  );
};
