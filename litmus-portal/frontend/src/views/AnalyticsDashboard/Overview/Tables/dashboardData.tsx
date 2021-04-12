import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PreconfiguredDashboardsArray from '../../../../components/PreconfiguredDashboards/data';
import { ListDashboardResponse } from '../../../../models/graphql/dashboardsDetails';
import useActions from '../../../../redux/actions';
import * as DashboardActions from '../../../../redux/actions/dashboards';
import * as DataSourceActions from '../../../../redux/actions/dataSource';
import * as TabActions from '../../../../redux/actions/tabs';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as Arrow } from '../../../../svg/arrow.svg';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import { GetTimeDiff } from '../../../../utils/timeDifferenceString';
import useStyles from '../styles';

interface TableDashboardData {
  dashboardDataList: ListDashboardResponse[];
}
const TableDashboardData: React.FC<TableDashboardData> = ({
  dashboardDataList,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);
  const currentTime = new Date().valueOf();
  const dataSource = useActions(DataSourceActions);
  const dashboard = useActions(DashboardActions);
  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const onDashboardLoadRoutine = async (data: ListDashboardResponse) => {
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

  return (
    <div>
      {dashboardDataList && dashboardDataList.length > 0 ? (
        <Paper className={classes.dataTable}>
          <div className={classes.tableHeading}>
            <Typography variant="h4" className={classes.weightedHeading}>
              {t('analyticsDashboard.applicationDashboard')}
            </Typography>
            {dashboardDataList.length > 3 ? (
              <IconButton
                className={classes.seeAllArrowBtn}
                onClick={() => {
                  tabs.changeAnalyticsDashboardTabs(2);
                  history.push({
                    pathname: '/analytics',
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  });
                }}
              >
                <Typography className={classes.seeAllText}>
                  {t('analyticsDashboard.seeAll')}
                </Typography>
                <Arrow className={classes.arrowForwardIcon} />
              </IconButton>
            ) : (
              <div />
            )}
          </div>
          <Table className={classes.tableStyling}>
            <TableBody>
              {dashboardDataList.slice(0, 3).map((dashboard) => (
                <TableRow key={dashboard.db_id} className={classes.tableRow}>
                  <TableCell scope="row" className={classes.tableRowHeader}>
                    <div className={classes.workTableIconText}>
                      <img
                        src={
                          PreconfiguredDashboardsArray.map((elem) => {
                            if (elem.name === dashboard.db_type) {
                              return elem.urlToIcon;
                            }
                            return undefined;
                          }).filter((item) => item)[0]
                        }
                        alt="icon"
                      />

                      <Typography className={classes.dataRowName}>
                        {dashboard.db_name}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography className={classes.dateText}>
                      {t('analyticsDashboard.timeText.lastOpened')}:{' '}
                      {GetTimeDiff(
                        currentTime / 1000,
                        parseInt(dashboard.updated_at, 10),
                        t
                      )}{' '}
                      {t('analyticsDashboard.timeText.ago')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      className={classes.seeAllBtn}
                      disableRipple
                      disableFocusRipple
                      onClick={() => {
                        onDashboardLoadRoutine(dashboard).then(() => {
                          history.push({
                            pathname: '/analytics/dashboard',
                            search: `?projectID=${projectID}&projectRole=${projectRole}`,
                          });
                        });
                      }}
                    >
                      <Typography className={classes.seeAllText}>
                        {t('analyticsDashboard.seeAnalytics')}
                      </Typography>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <div />
      )}
    </div>
  );
};
export { TableDashboardData };
