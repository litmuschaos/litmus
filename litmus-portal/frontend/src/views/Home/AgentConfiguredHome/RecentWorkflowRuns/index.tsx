import { Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
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
  const classes = useStyles();

  const projectID = getProjectID();
  const projectRole = getProjectRole();

  const filteredData = data.getWorkFlowRuns.slice(-3).reverse();

  return (
    <Paper className={classes.workflowRunContainer}>
      {/* Heading section of the container */}
      <div className={classes.containerHeading}>
        <Typography id="heading">Recent Workflow runs</Typography>
        <Link
          to={{
            pathname: '/workflows',
            search: `?projectID=${projectID}&projectRole=${projectRole}`,
          }}
        >
          <Typography>
            View all {data.getWorkFlowRuns.length} workflows
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
          <Typography>Schedule workflow</Typography>
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
