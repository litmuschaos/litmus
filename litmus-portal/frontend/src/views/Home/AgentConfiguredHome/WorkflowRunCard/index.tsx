import { Link, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowRun } from '../../../../models/graphql/workflowData';
import useActions from '../../../../redux/actions';
import * as NodeSelectionActions from '../../../../redux/actions/nodeSelection';
import { history } from '../../../../redux/configureStore';
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

interface WorkflowRunCardProps {
  data: Partial<WorkflowRun>;
}

const WorkflowRunCard: React.FC<WorkflowRunCardProps> = ({ data }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const nodeSelection = useActions(NodeSelectionActions);

  function getStatusVariant(phase: string | undefined): string {
    switch (phase) {
      case SUCCEEDED:
        return 'status-success.svg';
      case RUNNING:
        return 'status-running.svg';
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

  function getResiliencyScoreVariant(score: number) {
    if (score <= 40) {
      return classes.lowScore;
    }
    if (score > 40 && score < 79) {
      return classes.mediumScore;
    }
    return classes.highScore;
  }

  return (
    <Link
      underline="none"
      color="initial"
      onClick={() => {
        nodeSelection.selectNode({
          pod_name: '',
        });

        history.push({
          pathname: `/scenarios/${data.workflowRunID}`,
          search: `?projectID=${projectID}&projectRole=${projectRole}`,
        });
      }}
      title={t(
        'homeViews.agentConfiguredHome.recentWorkflowRuns.workflowRunCard.cardTitle'
      )}
    >
      <div className={classes.animatedContainer}>
        <div className={classes.workflowDataContainer}>
          <div>
            <div className={classes.statusDiv}>
              <img
                src={`./icons/${getStatusVariant(data.phase)}`}
                alt={data.phase}
                title={data.phase}
              />
              <div>
                <Typography
                  className={`${classes.testName} ${classes.noWrapProvider}`}
                >
                  {data.workflowName}
                </Typography>
                <Typography className={classes.hint}>
                  {data.clusterName}
                </Typography>
              </div>
            </div>
          </div>

          <div>
            <Typography className={classes.hint}>
              {t(
                'homeViews.agentConfiguredHome.recentWorkflowRuns.workflowRunCard.resilienceRate'
              )}
            </Typography>
            <Typography
              className={getResiliencyScoreVariant(data.resiliencyScore ?? 0)}
            >
              {data.resiliencyScore === undefined ||
              data.resiliencyScore === null
                ? 'NA'
                : `${data.resiliencyScore}%`}
            </Typography>
          </div>

          <div>
            <Typography className={classes.hint}>
              {t(
                'homeViews.agentConfiguredHome.recentWorkflowRuns.workflowRunCard.lastRun'
              )}
            </Typography>
            <Typography
              className={`${classes.noWrapProvider} ${classes.lastRunTime}`}
            >
              {timeDifferenceForDate(data.lastUpdated)}
            </Typography>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorkflowRunCard;
