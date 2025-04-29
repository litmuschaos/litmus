import { Classes, Intent, Menu, MenuDivider, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { Button, Layout, ButtonVariation, useToaster, useToggleOpen, ConfirmationDialog } from '@harnessio/uicore';
import { parse } from 'yaml';
import React from 'react';
import { useHistory } from 'react-router-dom';
import type { Row } from 'react-table';
import type { ExperimentDetails, RefetchExperiments } from '@controllers/ExperimentDashboardV2';
import { useRouteWithBaseUrl } from '@hooks';
import { useStrings } from '@strings';
import { getScope, downloadYamlAsFile, yamlStringify, killEvent } from '@utils';
import { deleteChaosExperiment } from '@api/core';
import { PermissionGroup, StudioTabs } from '@models';
import { ExperimentRunStatus } from '@api/entities';
import RbacMenuItem from '@components/RbacMenuItem';

export const MenuCell = ({
  row: { original: data, refetchExperiments }
}: {
  row: Row<ExperimentDetails> & Partial<RefetchExperiments>;
}): React.ReactElement => {
  const scope = getScope();
  const { getString } = useStrings();
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const { showError, showSuccess } = useToaster();
  const { isOpen, open: openDeleteDialog, close: closeDeleteDialog } = useToggleOpen();

  const [deleteChaosExperimentMutation] = deleteChaosExperiment({
    onCompleted: () => {
      showSuccess(getString('experimentDeleted'));
      refetchExperiments && refetchExperiments();
    },
    onError: error => showError(error.message)
  });

  const isDeleteButtonEnabled = !data.recentExecutions.some(
    execution => execution?.experimentRunStatus === ExperimentRunStatus.RUNNING
  );

  // <!-- confirmation dialog boxes -->
  const confirmationDialogProps = {
    usePortal: true,
    contentText: getString('deleteExperimentDesc'),
    titleText: getString('deleteExperimentHeading'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.DANGER,
    onClose: (isConfirmed: boolean) => {
      if (isConfirmed) {
        deleteChaosExperimentMutation({ variables: { projectID: scope.projectID, experimentID: data.experimentID } });
      }
      closeDeleteDialog();
    }
  };

  const confirmationDialog = <ConfirmationDialog isOpen={isOpen} {...confirmationDialogProps} />;

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }} onClick={killEvent}>
      <Popover className={Classes.DARK} position={Position.LEFT} interactionKind={PopoverInteractionKind.HOVER}>
        <Button variation={ButtonVariation.ICON} icon="Options" />
        <Menu style={{ backgroundColor: 'unset' }}>
          {/* <!-- edit experiment button --> */}
          <RbacMenuItem
            icon={'Edit'}
            text={getString('editExperiment')}
            onClick={() => {
              history.push({
                pathname: paths.toEditExperiment({ experimentKey: data.experimentID }),
                search: `tab=${StudioTabs.BUILDER}`
              });
            }}
            permission={PermissionGroup.OWNER}
          />
          {/* <!-- clone experiment button --> */}
          <RbacMenuItem
            icon={'copy-alt'}
            text={getString('cloneExperiment')}
            onClick={() => {
              history.push({
                pathname: paths.toCloneExperiment({ experimentKey: data.experimentID })
              });
            }}
            permission={PermissionGroup.Executor}
          />
          {/* <!-- view executions button --> */}
          <RbacMenuItem
            icon={'list-detail-view'}
            text={getString('viewExecutions')}
            disabled={!data?.recentExecutions?.length}
            onClick={() => {
              history.push({
                pathname: paths.toExperimentRunHistory({ experimentID: data.experimentID })
              });
            }}
            permission={PermissionGroup.VIEWER}
          />
          {/* <!-- download manifest button --> */}
          <RbacMenuItem
            icon={'import'}
            text={getString('downloadExperiment')}
            onClick={() => {
              downloadYamlAsFile(yamlStringify(parse(data.experimentManifest)), `${data.experimentName}.yml`);
            }}
            permission={PermissionGroup.VIEWER}
          />
          <MenuDivider />
          {/* <!-- delete experiment button --> */}
          <RbacMenuItem
            icon="main-trash"
            text={getString('deleteExperiment')}
            onClick={openDeleteDialog}
            disabled={isDeleteButtonEnabled == false}
            permission={PermissionGroup.OWNER}
          />
        </Menu>
      </Popover>
      {confirmationDialog}
    </Layout.Horizontal>
  );
};
