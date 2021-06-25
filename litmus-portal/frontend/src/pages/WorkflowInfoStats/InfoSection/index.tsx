import { Typography } from '@material-ui/core';
import parser from 'cron-parser';
import cronstrue from 'cronstrue';
import React from 'react';
import YAML from 'yaml';
import { ScheduledWorkflows } from '../../../models/graphql/workflowListData';
import timeDifferenceForDate from '../../../utils/datesModifier';
import useStyles from './styles';

interface InfoSectionProps {
  data: ScheduledWorkflows;
}

const InfoSection: React.FC<InfoSectionProps> = ({ data }) => {
  const classes = useStyles();

  console.log(data);

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
              Total Runs : {/* Replace with LIST_API */}
              {data.ListWorkflow.workflows[0].workflow_runs?.length}
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
          <div>
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
          {/* Column end */}
        </div>
      </div>
    </section>
  );
};

export { InfoSection };
