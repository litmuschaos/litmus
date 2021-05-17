import { Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Workflow } from '../../../../models/graphql/workflowData';
import { history } from '../../../../redux/configureStore';
import {
  getProjectID,
  getProjectRole,
} from '../../../../utils/getSearchParams';
import useStyles from './styles';
import { WorkflowRunCard } from './WorkflowRunCard';

interface RecentWorkflowRunsProps {
  data: Workflow;
}

const RecentWorkflowRuns: React.FC<RecentWorkflowRunsProps> = ({ data }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const filteredData = data.getWorkflowRuns.workflow_runs.slice(-3).reverse();

  return (
    <Paper className={classes.workflowRunContainer}>
      {/* Heading section of the container */}
      <div className={classes.containerHeading}>
        <Typography id="heading">
          {t('homeViews.agentConfiguredHome.recentWorkflowRuns.heading')}
        </Typography>
        <Link
          to={{
            pathname: '/workflows',
            search: `?projectID=${projectID}&projectRole=${projectRole}`,
          }}
        >
          <Typography>
            {t('homeViews.agentConfiguredHome.recentWorkflowRuns.viewAll')}
          </Typography>
        </Link>
        <ButtonFilled
          onClick={() => {
            history.push({
              pathname: '/create-workflow',
              search: `?projectID=${projectID}&projectRole=${projectRole}`,
            });
          }}
        >
          <Typography>
            <img src="./icons/calendarBlank.svg" alt="calendar" />
            {t('homeViews.agentConfiguredHome.recentWorkflowRuns.schedule')}
          </Typography>
        </ButtonFilled>
      </div>

      {/* WorkflowRuns Data */}

      {filteredData.map((workflow) => {
        return <WorkflowRunCard key={workflow.workflow_id} data={workflow} />;
      })}
    </Paper>
  );
};

export { RecentWorkflowRuns };
