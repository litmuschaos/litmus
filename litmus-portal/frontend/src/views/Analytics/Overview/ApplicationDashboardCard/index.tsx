import { IconButton, Typography } from '@material-ui/core';
import React from 'react';
import {
  DashboardExport,
  PanelExport,
  PanelGroupExport,
  PanelGroupMap,
  PromQueryExport,
} from '../../../../models/dashboardsData';
import {
  ApplicationMetadata,
  ListDashboardResponse,
  PanelOption,
  Resource,
} from '../../../../models/graphql/dashboardsDetails';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as AnalyticsIcon } from '../../../../svg/analytics.svg';
import { ReactComponent as CogwheelIcon } from '../../../../svg/cogwheel.svg';
import { ReactComponent as DownloadIcon } from '../../../../svg/download.svg';
import timeDifferenceForDate from '../../../../utils/datesModifier';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles from './styles';

interface ApplicationDashboardCardProps {
  data: ListDashboardResponse;
}

const ApplicationDashboardCard: React.FC<ApplicationDashboardCardProps> = ({
  data,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dashboard = useActions(DashboardActions);

  const onDashboardLoadRoutine = async () => {
    dashboard.selectDashboard({
      selectedDashboardID: data.db_id,
      selectedAgentID: data.cluster_id,
    });
    return true;
  };

  const getDashboard = () => {
    const panelGroupMap: PanelGroupMap[] = [];
    const panelGroups: PanelGroupExport[] = [];
    data.panel_groups.forEach((panelGroup) => {
      panelGroupMap.push({
        groupName: panelGroup.panel_group_name,
        panels: [],
      });
      const len: number = panelGroupMap.length;
      const selectedPanels: PanelExport[] = [];
      panelGroup.panels.forEach((panel) => {
        panelGroupMap[len - 1].panels.push(panel.panel_name);
        const queries: PromQueryExport[] = [];
        panel.prom_queries.forEach((query) => {
          queries.push({
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
        const selectedPanel: PanelExport = {
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

    const applicationMetadataMap: ApplicationMetadata[] = [];

    if (data.application_metadata_map) {
      data.application_metadata_map.forEach((applicationMetadata) => {
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
    }

    const exportedDashboard: DashboardExport = {
      dashboardID: data.db_type_id,
      name: data.db_name,
      information: data.db_information,
      chaosEventQueryTemplate: data.chaos_event_query_template,
      chaosVerdictQueryTemplate: data.chaos_verdict_query_template,
      applicationMetadataMap,
      panelGroupMap,
      panelGroups,
    };

    return exportedDashboard;
  };

  // Function to download the JSON
  const downloadJSON = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(getDashboard(), null, 2)], {
      type: 'text/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${data.db_name}.json`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <>
      <div className={classes.animatedContainer}>
        <div className={classes.workflowDataContainer}>
          <div>
            <div className={classes.statusDiv}>
              <img
                src={`./icons/${data.db_type_id}_dashboard.svg`}
                alt="k8s"
                title={data.db_type}
              />
              <div>
                <Typography
                  className={`${classes.testName} ${classes.noWrapProvider}`}
                >
                  {data.db_name}
                </Typography>
                <Typography className={classes.hint}>
                  Agent: {data.cluster_name}
                </Typography>
              </div>
            </div>
          </div>
          <Typography className={`${classes.noWrapProvider} ${classes.hint}`}>
            {timeDifferenceForDate(data.viewed_at)}
          </Typography>
          <section className={classes.cardActionsSection}>
            <div className={classes.cardActions}>
              <IconButton
                onClick={() => {
                  onDashboardLoadRoutine().then(() => {
                    history.push({
                      pathname: '/analytics/application-dashboard',
                      search: `?projectID=${projectID}&projectRole=${projectRole}`,
                    });
                  });
                }}
              >
                <AnalyticsIcon />
              </IconButton>
              <Typography align="center">View</Typography>
            </div>
            <div className={classes.cardActions}>
              <IconButton
                onClick={() => {
                  dashboard.selectDashboard({
                    selectedDashboardID: data.db_id,
                    activePanelID: '',
                  });
                  history.push({
                    pathname: '/analytics/dashboard/configure',
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  });
                }}
              >
                <CogwheelIcon />
              </IconButton>
              <Typography align="center">Configure</Typography>
            </div>
            <div className={classes.cardActions}>
              <IconButton onClick={() => downloadJSON()}>
                <DownloadIcon />
              </IconButton>
              <Typography align="center">JSON</Typography>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export { ApplicationDashboardCard };
