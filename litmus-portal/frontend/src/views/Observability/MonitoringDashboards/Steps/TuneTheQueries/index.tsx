/* eslint-disable no-unused-expressions */
import { useMutation } from '@apollo/client';
import { Typography } from '@material-ui/core';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CREATE_DASHBOARD, UPDATE_DASHBOARD } from '../../../../../graphql';
import {
  DashboardDetails,
  PanelDetails,
} from '../../../../../models/dashboardsData';
import {
  Panel,
  PanelGroup,
  PromQuery,
  UpdatePanelGroupRequest,
} from '../../../../../models/graphql/dashboardsDetails';
import {
  DEFAULT_REFRESH_RATE,
  DEFAULT_RELATIVE_TIME_RANGE,
} from '../../../../../pages/MonitoringDashboard/constants';
import useActions from '../../../../../redux/actions';
import * as AlertActions from '../../../../../redux/actions/alert';
import * as DashboardActions from '../../../../../redux/actions/dashboards';
import { history } from '../../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../../utils/getSearchParams';
import EditPanelsWizard from './EditPanelsWizard';
import useStyles from './styles';

interface TuneTheQueriesProps {
  isLoading: (status: boolean) => void;
  configure: boolean;
  activeEditPanelID: string;
  dashboardVars: DashboardDetails;
}

const TuneTheQueries = forwardRef(
  (
    {
      isLoading,
      configure,
      activeEditPanelID,
      dashboardVars,
    }: TuneTheQueriesProps,
    ref
  ) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const projectID = getProjectID();
    const projectRole = getProjectRole();
    const alert = useActions(AlertActions);
    const dashboard = useActions(DashboardActions);
    const [proceed, setProceed] = React.useState<boolean>(false);

    const [updatedDashboardDetails, setUpdatedDashboardDetails] =
      useState<DashboardDetails>({
        selectedPanels: [],
      });

    const onDashboardLoadRoutine = async (dbID: string) => {
      dashboard.selectDashboard({
        selectedDashboardID: dbID,
        selectedAgentID: dashboardVars.agentID ?? '',
      });
      return true;
    };

    const [createDashboard] = useMutation(CREATE_DASHBOARD, {
      onCompleted: (data) => {
        isLoading(false);
        setProceed(true);
        onDashboardLoadRoutine(data.createDashBoard?.dbID ?? '').then(() => {
          history.push({
            pathname: '/analytics/monitoring-dashboard',
            search: `?projectID=${projectID}&projectRole=${projectRole}`,
          });
        });
      },
      onError: () => {
        alert.changeAlertState(true);
        isLoading(false);
        setProceed(false);
      },
    });
    const [updateDashboard] = useMutation(UPDATE_DASHBOARD, {
      onCompleted: () => {
        isLoading(false);
        setProceed(true);
        onDashboardLoadRoutine(dashboardVars.id ?? '').then(() => {
          history.push({
            pathname: '/analytics/monitoring-dashboard',
            search: `?projectID=${projectID}&projectRole=${projectRole}`,
          });
        });
      },
      onError: () => {
        alert.changeAlertState(true);
        isLoading(false);
        setProceed(false);
      },
    });

    const getPanelGroups = () => {
      if (configure === false) {
        const panelGroups: PanelGroup[] = [];
        updatedDashboardDetails.selectedPanels?.forEach((panelDetails) => {
          const panelQueries: PromQuery[] = [];
          panelDetails.promQueries.forEach((query) => {
            panelQueries.push({
              queryID: query.queryID,
              promQueryName: query.promQueryName,
              legend: query.legend,
              resolution: query.resolution,
              minstep: query.minstep,
              line: query.line,
              closeArea: query.closeArea,
            });
          });
          const panel: Panel = {
            promQueries: panelQueries,
            panelOptions: panelDetails.panelOptions,
            panelName: panelDetails.panelName,
            yAxisLeft: panelDetails.yAxisLeft,
            yAxisRight: panelDetails.yAxisRight,
            xAxisDown: panelDetails.xAxisDown,
            unit: panelDetails.unit,
          };
          let panelGroupFound = false;
          panelGroups.forEach((panelGroup, index) => {
            if (panelGroup.panelGroupName === panelDetails.panelGroupName) {
              panelGroups[index].panels.push(panel);
              panelGroupFound = true;
            }
          });
          if (!panelGroupFound) {
            panelGroups.push({
              panelGroupName: panelDetails.panelGroupName ?? '',
              panels: [panel],
            });
          }
        });
        return panelGroups;
      }
      const panelGroups: UpdatePanelGroupRequest[] = [];
      updatedDashboardDetails.selectedPanels?.forEach((panelDetails) => {
        const panelQueries: PromQuery[] = [];
        panelDetails.promQueries.forEach((query) => {
          panelQueries.push({
            queryID: query.queryID,
            promQueryName: query.promQueryName,
            legend: query.legend,
            resolution: query.resolution,
            minstep: query.minstep,
            line: query.line,
            closeArea: query.closeArea,
          });
        });
        const panel: Panel = {
          panelID: panelDetails.panelID ?? '',
          createdAt: panelDetails.createdAt ?? '',
          panelGroupID: panelDetails.panelGroupID ?? '',
          promQueries: panelQueries,
          panelOptions: panelDetails.panelOptions,
          panelName: panelDetails.panelName,
          yAxisLeft: panelDetails.yAxisLeft,
          yAxisRight: panelDetails.yAxisRight,
          xAxisDown: panelDetails.xAxisDown,
          unit: panelDetails.unit,
        };
        let panelGroupFound = false;
        panelGroups.forEach((panelGroup, index) => {
          if (panelGroup.panelGroupName === panelDetails.panelGroupName) {
            if (panelDetails.panelGroupID !== panelGroup.panelGroupID) {
              panel.panelGroupID = panelGroup.panelGroupID;
            }
            panelGroups[index].panels.push(panel);
            panelGroupFound = true;
          }
        });
        if (!panelGroupFound) {
          panelGroups.push({
            panelGroupID: panelDetails.panelGroupID ?? '',
            panelGroupName: panelDetails.panelGroupName ?? '',
            panels: [panel],
          });
        }
      });
      return panelGroups;
    };

    const handleCreateMutation = () => {
      isLoading(true);
      const dashboardInput = {
        dsID: dashboardVars.dataSourceID ?? '',
        dbName: dashboardVars.name ?? '',
        dbTypeID: dashboardVars.dashboardTypeID ?? '',
        dbTypeName: dashboardVars.dashboardTypeName ?? '',
        dbInformation: dashboardVars.information ?? '',
        chaosEventQueryTemplate: dashboardVars.chaosEventQueryTemplate ?? '',
        chaosVerdictQueryTemplate:
          dashboardVars.chaosVerdictQueryTemplate ?? '',
        applicationMetadataMap: dashboardVars.applicationMetadataMap ?? [],
        panelGroups: getPanelGroups(),
        endTime: `${Math.round(new Date().getTime() / 1000)}`,
        startTime: `${
          Math.round(new Date().getTime() / 1000) - DEFAULT_RELATIVE_TIME_RANGE
        }`,
        projectID,
        clusterID: dashboardVars.agentID ?? '',
        refreshRate: `${DEFAULT_REFRESH_RATE}`,
      };
      createDashboard({
        variables: { dashboard: dashboardInput },
      });
    };

    const handleUpdateMutation = () => {
      isLoading(true);
      const dashboardInput = {
        dbID: dashboardVars.id ?? '',
        dsID: dashboardVars.dataSourceID ?? '',
        dbName: dashboardVars.name ?? '',
        dbTypeID: dashboardVars.dashboardTypeID ?? '',
        dbTypeName: dashboardVars.dashboardTypeName ?? '',
        dbInformation: dashboardVars.information ?? '',
        applicationMetadataMap: dashboardVars.applicationMetadataMap ?? [],
        panelGroups: getPanelGroups(),
        endTime: `${Math.round(new Date().getTime() / 1000)}`,
        startTime: `${
          Math.round(new Date().getTime() / 1000) - DEFAULT_RELATIVE_TIME_RANGE
        }`,
        refreshRate: `${DEFAULT_REFRESH_RATE}`,
        clusterID: dashboardVars.agentID ?? '',
      };
      updateDashboard({
        variables: {
          projectID: getProjectID(),
          dashboard: dashboardInput,
          chaosQueryUpdate: false,
        },
      });
    };

    function onNext() {
      if (configure) {
        handleUpdateMutation();
      } else {
        handleCreateMutation();
      }
      return proceed;
    }

    useImperativeHandle(ref, () => ({
      onNext,
    }));

    const CallbackToSetPanels = (panels: PanelDetails[]) => {
      setUpdatedDashboardDetails({ selectedPanels: panels });
    };

    return (
      <div className={classes.root}>
        <Typography className={classes.heading}>
          {t('monitoringDashboard.monitoringDashboards.tuneTheQueries.header')}
        </Typography>
        <Typography className={classes.description}>
          {t(
            'monitoringDashboard.monitoringDashboards.tuneTheQueries.description'
          )}
        </Typography>
        <div className={classes.editPanelsWizard}>
          <EditPanelsWizard
            configure={configure}
            activeEditPanelID={activeEditPanelID}
            dashboardVars={dashboardVars}
            CallbackToSetPanels={CallbackToSetPanels}
          />
        </div>
      </div>
    );
  }
);

export default TuneTheQueries;
