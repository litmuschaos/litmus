import React from 'react';
import { DashboardData } from '../../../../models/dashboardsData';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { history } from '../../../../redux/configureStore';
import DashboardCard from './index';
import useStyles from '../../DataSource/Cards/styles';

interface DashboardCardsProps {
  dashboards: DashboardData[];
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ dashboards }) => {
  const classes = useStyles();
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
                history.push('/analytics/dashboard/create');
              }}
              description={d.description}
            />
          </div>
        ))}
    </div>
  );
};

export default DashboardCards;
