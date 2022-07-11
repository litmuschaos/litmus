import { IconButton, Typography } from '@material-ui/core';
import React from 'react';
import {
  DashboardExport,
  PanelExport,
  PanelGroupExport,
  PanelGroupMap,
  PromQueryExport
} from '../../../../models/dashboardsData';
import {
  ApplicationMetadata,
  GetDashboardResponse,
  PanelOption,
  Resource
} from '../../../../models/graphql/dashboardsDetails';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as CogwheelIcon } from '../../../../svg/cogwheel.svg';
import { ReactComponent as DownloadIcon } from '../../../../svg/download.svg';
import { ReactComponent as ObservabilityIcon } from '../../../../svg/observability.svg';
import timeDifferenceForDate from '../../../../utils/datesModifier';
import {
  getProjectID,
  getProjectRole
} from '../../../../utils/getSearchParams';
import useStyles from './styles';

interface MonitoringDashboardCardProps {
  data: GetDashboardResponse;
}

const MonitoringDashboardCard: React.FC<MonitoringDashboardCardProps> = ({
  data,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dashboard = useActions(DashboardActions);

  const onDashboardLoadRoutine = async () => {
    dashboard.selectDashboard({
      selectedDashboardID: data.dbID,
      selectedAgentID: data.clusterID,
    });
    return true;
  };

  const getDashboard = () => {
    const panelGroupMap: PanelGroupMap[] = [];
    const panelGroups: PanelGroupExport[] = [];
    data.panelGroups.forEach((panelGroup) => {
      panelGroupMap.push({
        groupName: panelGroup.panelGroupName,
        panels: [],
      });
      const len: number = panelGroupMap.length;
      const selectedPanels: PanelExport[] = [];
      panelGroup.panels.forEach((panel) => {
        panelGroupMap[len - 1].panels.push(panel.panelName);
        const queries: PromQueryExport[] = [];
        panel.promQueries.forEach((query) => {
          queries.push({
            prom_query_name: query.promQueryName,
            legend: query.legend,
            resolution: query.resolution,
            minstep: query.minstep,
            line: query.line,
            close_area: query.closeArea,
          });
        });
        const options: PanelOption = {
          points: panel.panelOptions.points,
          grIDs: panel.panelOptions.grIDs,
          leftAxis: panel.panelOptions.leftAxis,
        };
        const selectedPanel: PanelExport = {
          prom_queries: queries,
          panel_options: options,
          panel_name: panel.panelName,
          y_axis_left: panel.yAxisLeft,
          y_axis_right: panel.yAxisRight,
          x_axis_down: panel.xAxisDown,
          unit: panel.unit,
        };
        selectedPanels.push(selectedPanel);
      });
      panelGroups.push({
        panel_group_name: panelGroup.panelGroupName,
        panels: selectedPanels,
      });
    });

    const applicationMetadataMap: ApplicationMetadata[] = [];

    if (data.applicationMetadataMap) {
      data.applicationMetadataMap.forEach((applicationMetadata) => {
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
      dashboardID:
        data.dbTypeID !== 'custom' ? data.dbTypeID : 'custom-downloaded',
      name: data.dbName,
      information: data.dbInformation,
      chaosEventQueryTemplate: data.chaosEventQueryTemplate,
      chaosVerdictQueryTemplate: data.chaosVerdictQueryTemplate,
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
    element.download = `${data.dbName}.json`;
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
                src={`./icons/${
                  data.dbTypeID.includes('custom') ? 'custom' : data.dbTypeID
                }_dashboard.svg`}
                alt="k8s"
                title={data.dbType}
              />
              <div>
                <Typography
                  className={`${classes.testName} ${classes.noWrapProvider}`}
                >
                  {data.dbName}
                </Typography>
                <Typography className={classes.hint}>
                  Chaos Delegate: {data.clusterName}
                </Typography>
              </div>
            </div>
          </div>
          <Typography className={`${classes.noWrapProvider} ${classes.hint}`}>
            {timeDifferenceForDate(data.viewedAt)}
          </Typography>
          <section className={classes.cardActionsSection}>
            <div className={classes.cardActions}>
              <IconButton
                onClick={() => {
                  onDashboardLoadRoutine().then(() => {
                    history.push({
                      pathname: '/analytics/monitoring-dashboard',
                      search: `?projectID=${projectID}&projectRole=${projectRole}`,
                    });
                  });
                }}
              >
                <ObservabilityIcon />
              </IconButton>
              <Typography align="center">View</Typography>
            </div>
            <div className={classes.cardActions}>
              <IconButton
                onClick={() => {
                  dashboard.selectDashboard({
                    selectedDashboardID: data.dbID,
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

export { MonitoringDashboardCard };
