import { Typography } from '@material-ui/core';
import { ButtonFilled, Modal } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DASHBOARD_TYPE_1,
  DASHBOARD_TYPE_2,
} from '../../../../pages/MonitoringDashboardPage/constants';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as CrossMarkIcon } from '../../../../svg/crossmark.svg';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles from './styles';

interface DataSourceInactiveModalProps {
  dataSourceStatus: string;
  dashboardType: string;
  dashboardID: string;
  dashboardName: string;
}

const DataSourceInactiveModal: React.FC<DataSourceInactiveModalProps> = ({
  dataSourceStatus,
  dashboardType,
  dashboardID,
  dashboardName,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  // get ProjectID
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const dashboard = useActions(DashboardActions);

  return (
    <Modal open onClose={() => {}} width="60%">
      <div className={classes.modal}>
        <Typography align="center">
          <CrossMarkIcon className={classes.icon} />
        </Typography>
        <Typography
          className={classes.modalHeading}
          align="center"
          variant="h3"
        >
          {`${t(
            'analyticsDashboard.monitoringDashboardPage.dataSourceIs'
          )} ${dataSourceStatus}`}
        </Typography>
        <Typography
          align="center"
          variant="body1"
          className={classes.modalBody}
        >
          {t('analyticsDashboard.monitoringDashboardPage.dataSourceError')}
        </Typography>
        <div className={classes.flexButtons}>
          <ButtonFilled
            variant="success"
            onClick={() => {
              let dashboardTemplateID: number = -1;
              if (dashboardType === DASHBOARD_TYPE_1) {
                dashboardTemplateID = 0;
              } else if (dashboardType === DASHBOARD_TYPE_2) {
                dashboardTemplateID = 1;
              }
              dashboard.selectDashboard({
                selectedDashboardID: dashboardID,
                selectedDashboardName: dashboardName,
                selectedDashboardTemplateID: dashboardTemplateID,
              });
              history.push({
                pathname: '/analytics/dashboard/configure',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            {t(
              'analyticsDashboard.monitoringDashboardPage.reConfigureDashboard'
            )}
          </ButtonFilled>
          <ButtonFilled
            variant="success"
            onClick={() => {
              history.push({
                pathname: '/analytics/datasource/configure',
                search: `?projectID=${projectID}&projectRole=${projectRole}`,
              });
            }}
          >
            {t('analyticsDashboard.monitoringDashboardPage.updateDataSource')}
          </ButtonFilled>
        </div>
      </div>
    </Modal>
  );
};

export default DataSourceInactiveModal;
