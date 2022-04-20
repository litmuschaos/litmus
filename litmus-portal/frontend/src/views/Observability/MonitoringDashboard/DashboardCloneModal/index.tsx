/* eslint-disable no-unused-expressions */
import { useMutation } from '@apollo/client';
import { Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ButtonFilled, InputField, Modal, TextButton } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { CREATE_DASHBOARD } from '../../../../graphql/mutations';
import { SelectedDashboardInformation } from '../../../../models/dashboardsData';
import {
  ApplicationMetadata,
  CreateDashboardRequest,
  Panel,
  PanelGroup,
  PanelOption,
  PromQuery,
  Resource,
} from '../../../../models/graphql/dashboardsDetails';
import {
  DEFAULT_REFRESH_RATE,
  DEFAULT_RELATIVE_TIME_RANGE,
} from '../../../../pages/MonitoringDashboard/constants';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { getProjectID } from '../../../../utils/getSearchParams';
import { validateTextEmpty } from '../../../../utils/validate';
import useStyles from './styles';

interface DashboardCloneModalProps {
  dashboardData: SelectedDashboardInformation;
  onClose: () => void;
}

const DashboardCloneModal: React.FC<DashboardCloneModalProps> = ({
  dashboardData,
  onClose,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const dashboard = useActions(DashboardActions);
  const [cloneName, setCloneName] = React.useState<string>(
    `Copy of ${dashboardData.name}`
  );
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);

  const onDashboardLoadRoutine = async (dbID: string) => {
    dashboard.selectDashboard({
      selectedDashboardID: dbID,
    });
    return true;
  };

  const [createDashboard] = useMutation<CreateDashboardRequest>(
    CREATE_DASHBOARD,
    {
      onCompleted: (data) => {
        onDashboardLoadRoutine(data.createDashBoard?.dbID ?? '').then(() => {
          window.location.reload();
        });
      },
      onError: () => {
        setIsAlertOpen(true);
      },
    }
  );

  const getPanelGroups = () => {
    const panelGroups: PanelGroup[] = [];
    dashboardData.metaData?.panelGroups.forEach((panelGroup) => {
      const selectedPanels: Panel[] = [];
      panelGroup.panels.forEach((panel) => {
        const queries: PromQuery[] = [];
        panel.promQueries.forEach((query) => {
          queries.push({
            queryID: uuidv4(),
            promQueryName: query.promQueryName,
            legend: query.legend,
            resolution: query.resolution,
            minstep: query.minstep,
            line: query.line,
            closeArea: query.closeArea,
          });
        });
        const options: PanelOption = {
          points: panel.panelOptions.points,
          grids: panel.panelOptions.grids,
          leftAxis: panel.panelOptions.leftAxis,
        };
        const selectedPanel: Panel = {
          promQueries: queries,
          panelOptions: options,
          panelName: panel.panelName,
          yAxisLeft: panel.yAxisLeft,
          yAxisRight: panel.yAxisRight,
          xAxisDown: panel.xAxisDown,
          unit: panel.unit,
        };
        selectedPanels.push(selectedPanel);
      });
      panelGroups.push({
        panelGroupName: panelGroup.panelGroupName,
        panels: selectedPanels,
      });
    });
    return panelGroups;
  };

  const getApplicationMetadataMap = () => {
    const applicationMetadataMap: ApplicationMetadata[] = [];
    dashboardData.applicationMetadataMap?.forEach((applicationMetadata) => {
      const applications: Resource[] = [];
      applicationMetadata.applications.forEach((application) => {
        applications.push({
          kind: application.kind,
          names: application.names,
        });
      });
      applicationMetadataMap.push({
        namespace: applicationMetadata.namespace,
        applications,
      });
    });
    return applicationMetadataMap;
  };

  const handleCreateMutation = () => {
    const dashboardInput = {
      dsID: dashboardData.metaData?.dsID,
      dbName: cloneName,
      dbTypeID: dashboardData.typeID,
      dbTypeName: dashboardData.typeName,
      dbInformation: dashboardData.information,
      chaosEventQueryTemplate: dashboardData.chaosEventQueryTemplate,
      chaosVerdictQueryTemplate: dashboardData.chaosVerdictQueryTemplate,
      applicationMetadataMap: getApplicationMetadataMap(),
      panelGroups: getPanelGroups(),
      endTime: `${Math.round(new Date().getTime() / 1000)}`,
      startTime: `${
        Math.round(new Date().getTime() / 1000) - DEFAULT_RELATIVE_TIME_RANGE
      }`,
      projectID,
      clusterID: dashboardData.agentID,
      refresh_rate: `${DEFAULT_REFRESH_RATE}`,
    };
    createDashboard({
      variables: { createDBRequest: dashboardInput },
    });
  };

  return (
    <div>
      <Modal open onClose={() => onClose()} width="45%" height="fit-content">
        <div className={classes.modal}>
          <Typography className={classes.modalHeading} align="left">
            {t(
              'monitoringDashboard.monitoringDashboardPage.dashboardCloneModal.heading'
            )}
          </Typography>
          <InputField
            label="Name"
            data-cy="copyDashboardName"
            width="82.5%"
            variant={validateTextEmpty(cloneName) ? 'error' : 'primary'}
            onChange={(event: React.ChangeEvent<{ value: string }>) => {
              setCloneName((event.target as HTMLInputElement).value);
            }}
            value={cloneName}
          />
          <div className={classes.flexButtons}>
            <TextButton
              onClick={() => onClose()}
              className={classes.cancelButton}
            >
              <Typography className={classes.buttonText}>
                {t(
                  'monitoringDashboard.monitoringDashboardPage.dashboardCloneModal.cancel'
                )}
              </Typography>
            </TextButton>
            <ButtonFilled onClick={() => handleCreateMutation()}>
              <Typography
                className={`${classes.buttonText} ${classes.okButtonText}`}
              >
                {t(
                  'monitoringDashboard.monitoringDashboardPage.dashboardCloneModal.ok'
                )}
              </Typography>
            </ButtonFilled>
          </div>
        </div>
      </Modal>
      <Snackbar
        open={isAlertOpen}
        autoHideDuration={6000}
        onClose={() => setIsAlertOpen(false)}
      >
        <Alert onClose={() => setIsAlertOpen(false)} severity="error">
          {t(
            'monitoringDashboard.monitoringDashboardPage.dashboardCloneModal.error'
          )}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DashboardCloneModal;
