import { IconButton, Typography } from '@material-ui/core';
import React from 'react';
import { WorkflowRun } from '../../../../models/graphql/workflowData';
import useActions from '../../../../redux/actions';
import * as NodeSelectionActions from '../../../../redux/actions/nodeSelection';
import { history } from '../../../../redux/configureStore';
import { ReactComponent as ObservabilityIcon } from '../../../../svg/observability.svg';
import { ReactComponent as WorkflowRunIcon } from '../../../../svg/workflowRun.svg';
import timeDifferenceForDate from '../../../../utils/datesModifier';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import {
  FAILED,
  NOTAVAILABLE,
  PENDING,
  RUNNING,
  SUCCEEDED,
  TERMINATED,
} from '../../../WorkflowDetails/workflowConstants';
import useStyles from './styles';

interface WorkflowStatisticsCardProps {
  data: WorkflowRun;
}

const WorkflowStatisticsCard: React.FC<WorkflowStatisticsCardProps> = ({
  data,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const projectRole = getProjectRole();
  const nodeSelection = useActions(NodeSelectionActions);

  function getStatusVariant(phase: string) {
    switch (phase) {
      case RUNNING:
        return 'status-running.svg';
      case SUCCEEDED:
        return 'status-success.svg';
      case FAILED:
        return 'status-failed.svg';
      case PENDING:
        return 'status-pending.svg';
      case NOTAVAILABLE:
        return 'status-NotAvailable.svg';
      case TERMINATED:
        return 'status-terminated.svg';
      default:
        return '';
    }
  }

  return (
    <>
      <div className={classes.animatedContainer}>
        <div className={classes.workflowDataContainer} data-cy="workflowCard">
          <div>
            <div className={classes.statusDiv}>
              <img
                src={`./icons/${getStatusVariant(data.phase)}`}
                alt="k8s"
                title={data.phase}
              />
              <div>
                <Typography
                  className={`${classes.testName} ${classes.noWrapProvider}`}
                >
                  {data.workflowName}
                </Typography>
                <Typography className={classes.hint}>
                  Chaos Delegate: {data.clusterName}
                </Typography>
              </div>
            </div>
          </div>
          <Typography className={`${classes.noWrapProvider} ${classes.hint}`}>
            {timeDifferenceForDate(data.lastUpdated)}
          </Typography>
          <section className={classes.cardActionsSection}>
            <div className={classes.cardActions}>
              <IconButton
                onClick={() => {
                  nodeSelection.selectNode({
                    pod_name: '',
                  });
                  if (data.phase?.toLowerCase() !== 'notavailable')
                    history.push({
                      pathname: `/scenarios/${data.workflowRunID}`,
                      search: `?projectID=${projectID}&projectRole=${projectRole}`,
                    });
                }}
              >
                <WorkflowRunIcon />
              </IconButton>
              <Typography align="center">See Chaos Scenario run</Typography>
            </div>
            <div className={classes.cardActions}>
              <IconButton
                onClick={() => {
                  history.push({
                    pathname: `/analytics/scenarioStatistics/${data.workflowID}`,
                    search: `?projectID=${projectID}&projectRole=${projectRole}`,
                  });
                }}
                data-cy="statsButton"
              >
                <ObservabilityIcon />
              </IconButton>
              <Typography align="center">See statistics</Typography>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export { WorkflowStatisticsCard };
