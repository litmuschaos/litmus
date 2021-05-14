import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import { LightPills } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListDataSourceResponse } from '../../../../models/graphql/dataSourceDetails';
import useActions from '../../../../redux/actions';
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

interface TableDataSourceProps {
  dataSourceList: ListDataSourceResponse[];
}

const TableDataSource: React.FC<TableDataSourceProps> = ({
  dataSourceList,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const tabs = useActions(TabActions);
  const currentTime = new Date().valueOf();
  const dataSource = useActions(DataSourceActions);
  const dataSourceActive = 'Active';
  const dataSourceNotReady = 'Not Ready';

  return (
    <div>
      {dataSourceList && dataSourceList.length > 0 ? (
        <Paper className={classes.dataTable}>
          <div className={classes.tableHeading}>
            <Typography variant="h4" className={classes.weightedHeading}>
              {t('analyticsDashboard.overviewTabdataSourceTable')}
            </Typography>
            {dataSourceList.length > 3 ? (
              <IconButton
                className={classes.seeAllArrowBtn}
                onClick={() => {
                  tabs.changeAnalyticsDashboardTabs(3);
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
              {dataSourceList.slice(0, 3).map((singleDataSource) => (
                <TableRow
                  key={singleDataSource.ds_id}
                  className={classes.tableRow}
                >
                  <TableCell scope="row" className={classes.tableRowHeader}>
                    <div className={classes.dataSourceTableHeader}>
                      {singleDataSource.health_status === dataSourceActive ? (
                        <LightPills
                          variant="success"
                          label={singleDataSource.health_status}
                        />
                      ) : singleDataSource.health_status ===
                        dataSourceNotReady ? (
                        <LightPills
                          variant="warning"
                          label={singleDataSource.health_status}
                        />
                      ) : (
                        <LightPills
                          variant="danger"
                          label={singleDataSource.health_status}
                        />
                      )}
                      <Typography className={classes.dataRowName}>
                        {singleDataSource.ds_name}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography className={classes.dateText}>
                      {t('analyticsDashboard.timeText.lastConfigured')}:{' '}
                      {GetTimeDiff(
                        currentTime / 1000,
                        parseInt(singleDataSource.updated_at, 10),
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
                        dataSource.selectDataSource({
                          selectedDataSourceID: singleDataSource.ds_id,
                          selectedDataSourceName: singleDataSource.ds_name,
                        });
                        history.push({
                          pathname: '/analytics/datasource/configure',
                          search: `?projectID=${projectID}&projectRole=${projectRole}`,
                        });
                      }}
                    >
                      <Typography className={classes.seeAllText}>
                        {t('analyticsDashboard.seeDetails')}
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
export { TableDataSource };
