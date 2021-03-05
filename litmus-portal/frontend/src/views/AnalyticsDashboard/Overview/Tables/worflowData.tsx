import {
  IconButton,
  Paper,
  Table,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScheduleWorkflow } from '../../../../models/graphql/scheduleData';
import useActions from '../../../../redux/actions';
import * as TabActions from '../../../../redux/actions/tabs';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as Arrow } from '../../../../svg/arrow.svg';
import { GetTimeDiff } from '../../../../utils/timeDifferenceString';
import useStyles from '../styles';

interface TableScheduleWorkflow {
  scheduleWorkflowList: ScheduleWorkflow[] | undefined;
}

const TableScheduleWorkflow: React.FC<TableScheduleWorkflow> = ({
  scheduleWorkflowList,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);
  const currentTime = new Date().valueOf();

  return (
    <div>
      {scheduleWorkflowList && scheduleWorkflowList.length > 0 ? (
        <Paper className={classes.dataTable}>
          <div className={classes.tableHeading}>
            <Typography variant="h4" className={classes.weightedHeading}>
              {t('analyticsDashboard.workflowScheduleTable.title')}
            </Typography>
            {scheduleWorkflowList && scheduleWorkflowList.length > 3 ? (
              <IconButton
                className={classes.seeAllArrowBtn}
                onClick={() => {
                  tabs.changeAnalyticsDashboardTabs(1);
                  history.push('/analytics');
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
          {scheduleWorkflowList && scheduleWorkflowList.length > 0 && (
            <Table className={classes.tableStyling}>
              {scheduleWorkflowList &&
                scheduleWorkflowList.slice(0, 3).map((schedule) => (
                  <TableRow
                    key={schedule.workflow_id}
                    className={classes.tableRow}
                  >
                    <TableCell scope="row" className={classes.tableRowHeader}>
                      <Typography className={classes.dataRowName}>
                        {schedule.workflow_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography className={classes.dateText}>
                        {t('analyticsDashboard.timeText.lastRun')}:{' '}
                        {GetTimeDiff(
                          currentTime / 1000,
                          parseInt(schedule.updated_at, 10),
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
                        onClick={() =>
                          history.push(
                            `/workflows/analytics/${schedule.workflow_id}`
                          )
                        }
                      >
                        <Typography className={classes.seeAllText}>
                          {t('analyticsDashboard.seeAnalytics')}
                        </Typography>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </Table>
          )}
        </Paper>
      ) : (
        <div />
      )}
    </div>
  );
};
export { TableScheduleWorkflow };
