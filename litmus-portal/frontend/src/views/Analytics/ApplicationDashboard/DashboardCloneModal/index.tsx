/* eslint-disable no-unused-expressions */
import { useMutation } from '@apollo/client';
import { Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { ButtonFilled, ButtonOutlined, InputField, Modal } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { CREATE_DASHBOARD } from '../../../../graphql/mutations';
import { SelectedDashboardInformation } from '../../../../models/dashboardsData';
import {
  ApplicationMetadata,
  CreateDashboardInput,
  Panel,
  PanelGroup,
  PanelOption,
  PromQuery,
  Resource,
} from '../../../../models/graphql/dashboardsDetails';
import {
  DEFAULT_DASHBOARD_REFRESH_RATE_STRING,
  DEFAULT_RELATIVE_TIME_RANGE,
} from '../../../../pages/ApplicationDashboard/constants';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
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
  // get ProjectID
  const projectID = getProjectID();
  const dashboard = useActions(DashboardActions);
  const dataSource = useActions(DataSourceActions);
  const [cloneName, setCloneName] = React.useState<string>(
    `Copy of ${dashboardData.name}`
  );
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);

  const onDashboardLoadRoutine = async (dbID: string) => {
    dashboard.selectDashboard({
      selectedDashboardID: dbID,
      refreshRate: 0,
    });
    dataSource.selectDataSource({
      selectedDataSourceURL: '',
      selectedDataSourceID: '',
      selectedDataSourceName: '',
    });
    return true;
  };

  const [createDashboard] = useMutation<CreateDashboardInput>(
    CREATE_DASHBOARD,
    {
      onCompleted: (data) => {
        onDashboardLoadRoutine(data.createDashBoard?.db_id ?? '').then(() => {
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
    dashboardData.metaData[0].panel_groups.forEach((panelGroup) => {
      const selectedPanels: Panel[] = [];
      panelGroup.panels.forEach((panel) => {
        const queries: PromQuery[] = [];
        panel.prom_queries.forEach((query) => {
          queries.push({
            queryid: uuidv4(),
            prom_query_name: query.prom_query_name,
            legend: query.legend,
            resolution: query.resolution,
            minstep: query.minstep,
            line: query.line,
            close_area: query.close_area,
          });
        });
        const options: PanelOption = {
          points: panel.panel_options.points,
          grids: panel.panel_options.grids,
          left_axis: panel.panel_options.left_axis,
        };
        const selectedPanel: Panel = {
          prom_queries: queries,
          panel_options: options,
          panel_name: panel.panel_name,
          y_axis_left: panel.y_axis_left,
          y_axis_right: panel.y_axis_right,
          x_axis_down: panel.x_axis_down,
          unit: panel.unit,
        };
        selectedPanels.push(selectedPanel);
      });
      panelGroups.push({
        panel_group_name: panelGroup.panel_group_name,
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
      ds_id: dashboardData.metaData[0].ds_id,
      db_name: cloneName,
      db_type_id: dashboardData.typeID,
      db_type_name: dashboardData.typeName,
      db_information: dashboardData.information,
      chaos_event_query_template: dashboardData.chaosEventQueryTemplate,
      chaos_verdict_query_template: dashboardData.chaosVerdictQueryTemplate,
      application_metadata_map: getApplicationMetadataMap(),
      panel_groups: getPanelGroups(),
      end_time: `${Math.round(new Date().getTime() / 1000)}`,
      start_time: `${
        Math.round(new Date().getTime() / 1000) - DEFAULT_RELATIVE_TIME_RANGE
      }`,
      project_id: projectID,
      cluster_id: dashboardData.agentID,
      refresh_rate: DEFAULT_DASHBOARD_REFRESH_RATE_STRING,
    };
    createDashboard({
      variables: { createDBInput: dashboardInput },
    });
  };

  return (
    <div>
      <Modal
        open
        onClose={() => {
          onClose();
        }}
        modalActions={
          <ButtonOutlined
            className={classes.closeButton}
            onClick={() => {
              onClose();
            }}
          >
            &#x2715;
          </ButtonOutlined>
        }
        width="45%"
        height="fit-content"
      >
        <div className={classes.modal}>
          <Typography className={classes.modalHeading} align="left">
            {t(
              'analyticsDashboard.monitoringDashboardPage.dashboardCloneModal.heading'
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
            <ButtonOutlined
              onClick={() => {
                onClose();
              }}
              className={classes.cancelButton}
            >
              <Typography className={classes.buttonText}>
                {t(
                  'analyticsDashboard.monitoringDashboardPage.dashboardCloneModal.cancel'
                )}
              </Typography>
            </ButtonOutlined>
            <ButtonFilled onClick={() => handleCreateMutation()}>
              <Typography
                className={`${classes.buttonText} ${classes.okButtonText}`}
              >
                {t(
                  'analyticsDashboard.monitoringDashboardPage.dashboardCloneModal.ok'
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
            'analyticsDashboard.monitoringDashboardPage.dashboardCloneModal.error'
          )}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DashboardCloneModal;
