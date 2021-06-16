import { useQuery } from '@apollo/client';
import { Typography } from '@material-ui/core';
import parser from 'cron-parser';
import cronstrue from 'cronstrue';
import { ButtonFilled, CalendarHeatmap } from 'litmus-ui';
import React from 'react';
import { useParams } from 'react-router';
import YAML from 'yaml';
import BackButton from '../../components/Button/BackButton';
import Scaffold from '../../containers/layouts/Scaffold';
import { WORKFLOW_LIST_DETAILS } from '../../graphql/queries';
import {
  ListWorkflowsInput,
  ScheduledWorkflows,
} from '../../models/graphql/workflowListData';
import timeDifferenceForDate from '../../utils/datesModifier';
import { getProjectID } from '../../utils/getSearchParams';
import useStyles from './styles';
import { TestCalendarHeatmapTooltip, testData } from './testData';

interface URLParams {
  workflowRunId: string;
}

const valueThreshold = [13, 26, 39, 49, 59, 69, 79, 89, 100];

const WorkflowInfoStats: React.FC = () => {
  const classes = useStyles();

  const projectID = getProjectID();

  const { workflowRunId }: URLParams = useParams();

  // Apollo query to get the scheduled workflow data
  const { data } = useQuery<ScheduledWorkflows, ListWorkflowsInput>(
    WORKFLOW_LIST_DETAILS,
    {
      variables: {
        workflowInput: { project_id: projectID, workflow_ids: [workflowRunId] },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  let parsedYAML;

  if (data) {
    parsedYAML = YAML.parse(data?.ListWorkflow.workflows[0].workflow_manifest);
    console.log('manifest Subject: ', parsedYAML.metadata.labels.subject);
  }

  return (
    <Scaffold>
      <BackButton />
      {/* Heading of the Page */}
      <div className={classes.headingSection}>
        <div className={classes.pageHeading}>
          <Typography className={classes.heading}>
            {data?.ListWorkflow.workflows[0].workflow_name}
          </Typography>
          <Typography className={classes.subHeading}>
            Here’s the analytics of the selected workflow
          </Typography>
        </div>
        <div>
          <ButtonFilled onClick={() => {}}>PDF</ButtonFilled>
        </div>
      </div>
      {/* Information and stats */}
      <div className={classes.infoStatsHeader}>
        <Typography className={classes.sectionHeading}>
          Information and statistics
        </Typography>
      </div>
      <div className={classes.infoStatsSection}>
        <div className={classes.infoStats}>
          {/* Individual Column for infoStats */}
          <div>
            <Typography className={classes.infoHeader}>
              Workflow details :
            </Typography>
            <Typography>
              Name :{' '}
              <span className={classes.infoHint}>
                {data?.ListWorkflow.workflows[0].workflow_name}
              </span>
            </Typography>
            <Typography>
              Id :{' '}
              <span className={classes.infoHint}>
                {data?.ListWorkflow.workflows[0].workflow_id}
              </span>
            </Typography>
            {data && (
              <Typography>
                Subject :{' '}
                <span className={classes.infoHint}>
                  {
                    YAML.parse(
                      data?.ListWorkflow.workflows[0].workflow_manifest
                    ).metadata.labels.subject
                  }
                </span>
              </Typography>
            )}
            {data && (
              <Typography>
                Namespace :{' '}
                <span className={classes.infoHint}>
                  {
                    YAML.parse(
                      data?.ListWorkflow.workflows[0].workflow_manifest
                    ).metadata.namespace
                  }
                </span>
              </Typography>
            )}
          </div>

          {/* Column 2 */}
          <div>
            <Typography className={classes.infoHeader}>Agent :</Typography>
            <Typography>
              Name :{' '}
              <span className={classes.infoHint}>
                {data?.ListWorkflow.workflows[0].cluster_name}
              </span>
            </Typography>
            <Typography>
              Id :{' '}
              <span className={classes.infoHint}>
                {data?.ListWorkflow.workflows[0].cluster_id}
              </span>
            </Typography>
          </div>
          {/* Column 3 */}
          <div>
            <Typography className={classes.infoHeader}>
              Total Runs :{' '}
              {data?.ListWorkflow.workflows[0].workflow_runs?.length}
            </Typography>
            <Typography>
              Last Run :{' '}
              <span className={classes.infoHint}>
                {timeDifferenceForDate(
                  data?.ListWorkflow.workflows[0].updated_at
                )}
              </span>
            </Typography>
            <Typography>
              Next Run :{' '}
              {data?.ListWorkflow.workflows[0].cronSyntax !== undefined && (
                <span className={classes.infoHint}>
                  {parser
                    .parseExpression(data?.ListWorkflow.workflows[0].cronSyntax)
                    .next()
                    .toString()}
                </span>
              )}
            </Typography>
          </div>
          {/* Column 4 */}
          <div>
            <Typography className={classes.infoHeader}>Regularity :</Typography>
            {data?.ListWorkflow.workflows[0].cronSyntax !== undefined && (
              <Typography>
                {cronstrue.toString(data?.ListWorkflow.workflows[0].cronSyntax)}
              </Typography>
            )}
          </div>
          {/* Column end */}
        </div>
      </div>

      {/* HeatMap Area */}
      <div className={classes.heatmapArea}>
        <Typography className={classes.sectionHeading}>Analytics</Typography>
        <div style={{ width: '100%', height: '10.5rem' }}>
          <CalendarHeatmap
            calendarHeatmapMetric={testData}
            valueThreshold={valueThreshold}
            CalendarHeatmapTooltip={TestCalendarHeatmapTooltip}
          />
        </div>
      </div>
    </Scaffold>
  );
};

export default WorkflowInfoStats;
