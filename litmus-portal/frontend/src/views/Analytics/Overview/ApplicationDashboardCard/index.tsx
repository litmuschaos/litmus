import { IconButton, Typography } from '@material-ui/core';
import React from 'react';
import { ListDashboardResponse } from '../../../../models/graphql/dashboardsDetails';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as AnalyticsIcon } from '../../../../svg/analytics.svg';
import { ReactComponent as CogwheelIcon } from '../../../../svg/cogwheel.svg';
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

  const dashboard = useActions(DashboardActions);
  const dataSource = useActions(DataSourceActions);

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const onDashboardLoadRoutine = async () => {
    dashboard.selectDashboard({
      selectedDashboardID: data.db_id,
      selectedDashboardName: data.db_name,
      selectedDashboardTemplateName: data.db_type,
      selectedAgentID: data.cluster_id,
      selectedAgentName: data.cluster_name,
      refreshRate: 0,
    });
    dataSource.selectDataSource({
      selectedDataSourceURL: '',
      selectedDataSourceID: '',
      selectedDataSourceName: '',
    });
    return true;
  };

  function getIconVariant(db_type: string) {
    switch (db_type) {
      case 'Kubernetes Platform':
        return 'kubernetes-platform.svg';
      case 'Sock Shop':
        return 'sock-shop.svg';
      default:
        return '';
    }
  }

  return (
    <>
      <div className={classes.animatedContainer}>
        <div className={classes.workflowDataContainer}>
          <div>
            <div className={classes.statusDiv}>
              <img
                src={`./icons/${getIconVariant(data.db_type)}`}
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
            {timeDifferenceForDate(data.updated_at)}
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
              <Typography>Analytics</Typography>
            </div>
            <div className={classes.cardActions}>
              <IconButton
                onClick={() => {
                  const dashboardType: string = data.db_type;
                  let dashboardTemplateID: number = -1;
                  if (dashboardType === 'Kubernetes Platform') {
                    dashboardTemplateID = 0;
                  } else if (dashboardType === 'Sock Shop') {
                    dashboardTemplateID = 1;
                  }
                  dashboard.selectDashboard({
                    selectedDashboardID: data.db_id,
                    selectedDashboardName: data.db_name,
                    selectedDashboardTemplateID: dashboardTemplateID,
                  });
                  history.push({
                    pathname: '/analytics/dashboard/configure',
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  });
                }}
              >
                <CogwheelIcon />
              </IconButton>
              <Typography>Configure</Typography>
            </div>
            {/* Will be added later */}
            {/* <div className={classes.cardActions} title="Coming soon!">
              <IconButton>
                <DownloadIcon />
              </IconButton>
              <Typography>JSON</Typography>
            </div> */}
          </section>
        </div>
      </div>
    </>
  );
};

export { ApplicationDashboardCard };
