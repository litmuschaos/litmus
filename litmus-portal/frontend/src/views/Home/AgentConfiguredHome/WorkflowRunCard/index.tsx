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
  PENDING,
  RUNNING,
  SUCCEEDED,
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

  function getPhaseVariant(variant: string | undefined): string {
    switch (variant) {
      case SUCCEEDED:
        return classes.succeeded;
      case RUNNING:
        return classes.running;
      case FAILED:
        return classes.failed;
      case PENDING:
        return classes.pending;
      default:
        return classes.pending;
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
          pathname: `/workflows/${data.workflow_run_id}`,
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
              <svg viewBox="0 0 10 10">
                <circle className={getPhaseVariant(data.phase)} />
              </svg>
              <div>
                <Typography
                  className={`${classes.testName} ${classes.noWrapProvider}`}
                >
                  {data.workflow_name}
                </Typography>
                <Typography className={classes.hint}>
                  {data.cluster_name}
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
              className={getResiliencyScoreVariant(data.resiliency_score ?? 0)}
            >
              {data.resiliency_score === undefined ||
              data.resiliency_score === null
                ? 'NA'
                : `${data.resiliency_score}%`}
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
              {timeDifferenceForDate(data.last_updated)}
            </Typography>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { WorkflowRunCard };
