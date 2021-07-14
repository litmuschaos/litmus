import { Typography } from '@material-ui/core';
import parser from 'cron-parser';
import cronstrue from 'cronstrue';
import { ButtonOutlined } from 'litmus-ui';
import React, { useState } from 'react';
import YAML from 'yaml';
import { ScheduledWorkflows } from '../../../models/graphql/workflowListData';
import timeDifferenceForDate from '../../../utils/datesModifier';
import useStyles from './styles';
import WorkflowStats from './WorkflowStats';

interface InfoSectionProps {
  data: ScheduledWorkflows;
  workflowRunLength: number;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  data,
  workflowRunLength,
}) => {
  const classes = useStyles();

  const [showMore, setShowMore] = useState<boolean>(false);

  return (
    <section>
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
                {data.ListWorkflow.workflows[0].workflow_name}
              </span>
            </Typography>
            <Typography>
              Id :{' '}
              <span className={classes.infoHint}>
                {data.ListWorkflow.workflows[0].workflow_id}
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
                {data.ListWorkflow.workflows[0].cluster_name}
              </span>
            </Typography>
            <Typography>
              Id :{' '}
              <span className={classes.infoHint}>
                {data.ListWorkflow.workflows[0].cluster_id}
              </span>
            </Typography>
          </div>
          {/* Column 3 */}
          <div>
            <Typography className={classes.infoHeader}>
              Total Runs :{workflowRunLength}
            </Typography>
            <Typography>
              Last Run :{' '}
              <span className={classes.infoHint}>
                {timeDifferenceForDate(
                  data.ListWorkflow.workflows[0].updated_at
                )}
              </span>
            </Typography>
            <Typography>
              Next Run :{' '}
              {data.ListWorkflow.workflows[0].cronSyntax !== undefined && (
                <span className={classes.infoHint}>
                  {parser
                    .parseExpression(data.ListWorkflow.workflows[0].cronSyntax)
                    .next()
                    .toString()}
                </span>
              )}
            </Typography>
          </div>
          {/* Column 4 */}
          <div className={classes.regularity}>
            <Typography className={classes.infoHeader}>Regularity :</Typography>
            {data.ListWorkflow.workflows[0].cronSyntax === '' ? (
              <Typography>Non cron workflow</Typography>
            ) : (
              data.ListWorkflow.workflows[0].cronSyntax !== undefined && (
                <Typography>
                  {cronstrue.toString(
                    data.ListWorkflow.workflows[0].cronSyntax
                  )}
                </Typography>
              )
            )}
          </div>
        </div>
        {showMore && (
          <WorkflowStats
            workflowID={data.ListWorkflow.workflows[0].workflow_id}
            isCron={data.ListWorkflow.workflows[0].cronSyntax !== ''}
            noOfWorkflowRuns={workflowRunLength ?? 0}
          />
        )}
      </div>
      <ButtonOutlined
        className={classes.button}
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? (
          <>
            <img src="./icons/hide.svg" alt="hide" className={classes.icon} />
            Hide Statistics
          </>
        ) : (
          <>
            <img src="./icons/show.svg" alt="show" className={classes.icon} />
            Show Statistics
          </>
        )}
      </ButtonOutlined>
    </section>
  );
};

export { InfoSection };
