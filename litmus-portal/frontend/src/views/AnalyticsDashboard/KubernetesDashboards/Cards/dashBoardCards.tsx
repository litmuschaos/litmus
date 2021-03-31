import React from 'react';
import { DashboardData } from '../../../../models/dashboardsData';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import DashboardCard from './index';
import useStyles from './styles';

interface DashboardCardsProps {
  dashboards: DashboardData[];
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ dashboards }) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dashboard = useActions(DashboardActions);
  return (
    <div className={classes.root}>
      {dashboards &&
        dashboards.map((d: DashboardData) => (
          <div key={d.dashboardID} data-cy="dashboardCard">
            <DashboardCard
              key={d.dashboardID}
              name={d.name}
              urlToIcon={d.urlToIcon}
              handleClick={() => {
                dashboard.selectDashboard({
                  selectedDashboardTemplateID: d.dashboardID,
                  selectedDashboardTemplateName: d.name,
                  selectedDashboardDescription: d.information,
                  selectedDashboardPanelGroupMap: d.panelGroupMap,
                });
                history.push({
                  pathname: '/analytics/dashboard/create',
                  search: `?projectID=${projectID}&projectRole=${projectRole}`,
                });
              }}
              description={d.description}
            />
          </div>
        ))}
    </div>
  );
};

export default DashboardCards;
