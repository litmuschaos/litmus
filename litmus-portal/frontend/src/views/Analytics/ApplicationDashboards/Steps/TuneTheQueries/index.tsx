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
  CreateDashboardInput,
  Panel,
  PanelGroup,
  PromQuery,
  UpdateDashboardInput,
  updatePanelGroupInput,
} from '../../../../../models/graphql/dashboardsDetails';
import {
  DEFAULT_DASHBOARD_REFRESH_RATE_STRING,
  DEFAULT_RELATIVE_TIME_RANGE,
} from '../../../../../pages/ApplicationDashboard/constants';
import useActions from '../../../../../redux/actions';
import * as AlertActions from '../../../../../redux/actions/alert';
import * as DashboardActions from '../../../../../redux/actions/dashboards';
import * as DataSourceActions from '../../../../../redux/actions/dataSource';
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
    const dataSource = useActions(DataSourceActions);
    const [proceed, setProceed] = React.useState<boolean>(false);

    const [
      updatedDashboardDetails,
      setUpdatedDashboardDetails,
    ] = useState<DashboardDetails>({
      selectedPanels: [],
    });

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
          isLoading(false);
          setProceed(true);
          onDashboardLoadRoutine(data.createDashBoard?.db_id ?? '').then(() => {
            history.push({
              pathname: '/analytics/application-dashboard',
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          });
        },
        onError: () => {
          alert.changeAlertState(true);
          isLoading(false);
          setProceed(false);
        },
      }
    );
    const [updateDashboard] = useMutation<UpdateDashboardInput>(
      UPDATE_DASHBOARD,
      {
        onCompleted: () => {
          isLoading(false);
          setProceed(true);
          onDashboardLoadRoutine(dashboardVars.id ?? '').then(() => {
            history.push({
              pathname: '/analytics/application-dashboard',
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          });
        },
        onError: () => {
          alert.changeAlertState(true);
          isLoading(false);
          setProceed(false);
        },
      }
    );

    const getPanelGroups = () => {
      if (configure === false) {
        const panelGroups: PanelGroup[] = [];
        updatedDashboardDetails.selectedPanels?.forEach((panelDetails) => {
          const panelQueries: PromQuery[] = [];
          panelDetails.prom_queries.forEach((query) => {
            panelQueries.push({
              queryid: query.queryid,
              prom_query_name: query.prom_query_name,
              legend: query.legend,
              resolution: query.resolution,
              minstep: query.minstep,
              line: query.line,
              close_area: query.close_area,
            });
          });
          const panel: Panel = {
            prom_queries: panelQueries,
            panel_options: panelDetails.panel_options,
            panel_name: panelDetails.panel_name,
            y_axis_left: panelDetails.y_axis_left,
            y_axis_right: panelDetails.y_axis_right,
            x_axis_down: panelDetails.x_axis_down,
            unit: panelDetails.unit,
          };
          let panelGroupFound = false;
          panelGroups.forEach((panelGroup, index) => {
            if (panelGroup.panel_group_name === panelDetails.panel_group_name) {
              panelGroups[index].panels.push(panel);
              panelGroupFound = true;
            }
          });
          if (!panelGroupFound) {
            panelGroups.push({
              panel_group_name: panelDetails.panel_group_name ?? '',
              panels: [panel],
            });
          }
        });
        return panelGroups;
      }
      const panelGroups: updatePanelGroupInput[] = [];
      updatedDashboardDetails.selectedPanels?.forEach((panelDetails) => {
        const panelQueries: PromQuery[] = [];
        panelDetails.prom_queries.forEach((query) => {
          panelQueries.push({
            queryid: query.queryid,
            prom_query_name: query.prom_query_name,
            legend: query.legend,
            resolution: query.resolution,
            minstep: query.minstep,
            line: query.line,
            close_area: query.close_area,
          });
        });
        const panel: Panel = {
          panel_id: panelDetails.panel_id ?? '',
          created_at: panelDetails.created_at ?? '',
          panel_group_id: panelDetails.panel_group_id ?? '',
          prom_queries: panelQueries,
          panel_options: panelDetails.panel_options,
          panel_name: panelDetails.panel_name,
          y_axis_left: panelDetails.y_axis_left,
          y_axis_right: panelDetails.y_axis_right,
          x_axis_down: panelDetails.x_axis_down,
          unit: panelDetails.unit,
        };
        let panelGroupFound = false;
        panelGroups.forEach((panelGroup, index) => {
          if (panelGroup.panel_group_name === panelDetails.panel_group_name) {
            if (panelDetails.panel_group_id !== panelGroup.panel_group_id) {
              panel.panel_group_id = panelGroup.panel_group_id;
            }
            panelGroups[index].panels.push(panel);
            panelGroupFound = true;
          }
        });
        if (!panelGroupFound) {
          panelGroups.push({
            panel_group_id: panelDetails.panel_group_id ?? '',
            panel_group_name: panelDetails.panel_group_name ?? '',
            panels: [panel],
          });
        }
      });
      return panelGroups;
    };

    const handleCreateMutation = () => {
      isLoading(true);
      const dashboardInput = {
        ds_id: dashboardVars.dataSourceID ?? '',
        db_name: dashboardVars.name ?? '',
        db_type_id: dashboardVars.dashboardTypeID ?? '',
        db_type_name: dashboardVars.dashboardTypeName ?? '',
        db_information: dashboardVars.information ?? '',
        chaos_event_query_template: dashboardVars.chaosEventQueryTemplate ?? '',
        chaos_verdict_query_template:
          dashboardVars.chaosVerdictQueryTemplate ?? '',
        application_metadata_map: dashboardVars.applicationMetadataMap ?? [],
        panel_groups: getPanelGroups(),
        end_time: `${Math.round(new Date().getTime() / 1000)}`,
        start_time: `${
          Math.round(new Date().getTime() / 1000) - DEFAULT_RELATIVE_TIME_RANGE
        }`,
        project_id: projectID,
        cluster_id: dashboardVars.agentID ?? '',
        refresh_rate: DEFAULT_DASHBOARD_REFRESH_RATE_STRING,
      };
      createDashboard({
        variables: { createDBInput: dashboardInput },
      });
    };

    const handleUpdateMutation = () => {
      isLoading(true);
      const dashboardInput = {
        db_id: dashboardVars.id ?? '',
        ds_id: dashboardVars.dataSourceID ?? '',
        db_name: dashboardVars.name ?? '',
        db_type_id: dashboardVars.dashboardTypeID ?? '',
        db_type_name: dashboardVars.dashboardTypeName ?? '',
        db_information: dashboardVars.information ?? '',
        chaos_event_query_template: dashboardVars.chaosEventQueryTemplate ?? '',
        chaos_verdict_query_template:
          dashboardVars.chaosVerdictQueryTemplate ?? '',
        application_metadata_map: dashboardVars.applicationMetadataMap ?? [],
        panel_groups: getPanelGroups(),
        end_time: `${Math.round(new Date().getTime() / 1000)}`,
        start_time: `${
          Math.round(new Date().getTime() / 1000) - DEFAULT_RELATIVE_TIME_RANGE
        }`,
        refresh_rate: DEFAULT_DASHBOARD_REFRESH_RATE_STRING,
        cluster_id: dashboardVars.agentID ?? '',
      };
      updateDashboard({
        variables: { updateDBInput: dashboardInput },
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
          {t('analyticsDashboard.applicationDashboards.tuneTheQueries.header')}
        </Typography>
        <Typography className={classes.description}>
          {t(
            'analyticsDashboard.applicationDashboards.tuneTheQueries.description'
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
