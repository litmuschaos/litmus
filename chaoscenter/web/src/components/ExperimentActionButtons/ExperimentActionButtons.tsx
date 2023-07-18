import React from 'react';
import { Color, PopoverProps } from '@harnessio/design-system';
import { useToaster, ButtonVariation, ButtonProps } from '@harnessio/uicore';
import cx from 'classnames';
import { Position } from '@blueprintjs/core';
import { useHistory } from 'react-router-dom';
import { parse } from 'yaml';
import { useStrings } from '@strings';
import { listExperiment, runChaosExperiment } from '@api/core';
import { useRouteWithBaseUrl } from '@hooks';
import type { RefetchExperiments } from '@controllers/ExperimentDashboardV2';
import { PermissionGroup, StudioTabs } from '@models';
import RbacButton from '@components/RbacButton';
import { downloadYamlAsFile, getScope, yamlStringify } from '@utils';
import css from './ExperimentActionButton.module.scss';

interface ActionButtonProps {
  experimentID: string;
  tooltipProps?: PopoverProps;
}

interface RunExperimentButtonProps extends ActionButtonProps, Partial<RefetchExperiments> {
  buttonProps?: ButtonProps;
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
        // permission={{
        //   resourceScope: scope,
        //   resource: {
        //     resourceType: ResourceType.CHAOS_EXPERIMENT
        //   },
        //   permission: PermissionIdentifier.EXECUTE_CHAOS_EXPERIMENT
        // }}
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
        permission={PermissionGroup.EDITOR}
      />
    </div>
  );
};
