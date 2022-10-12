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
              Chaos Scenario details :
            </Typography>
            <Typography>
              Name :{' '}
              <span className={classes.infoHint} data-cy="infoWorkflowName">
                {data.listWorkflows.workflows[0].workflowName}
              </span>
            </Typography>
            <Typography>
              Id :{' '}
              <span className={classes.infoHint} data-cy="infoWorkflowId">
                {data.listWorkflows.workflows[0].workflowID}
              </span>
            </Typography>
            {data && (
              <Typography>
                Subject :{' '}
                <span
                  className={classes.infoHint}
                  data-cy="infoWorkflowSubject"
                >
                  {
                    YAML.parse(
                      data?.listWorkflows.workflows[0].workflowManifest
                    ).metadata.labels.subject
                  }
                </span>
              </Typography>
            )}
            {data && (
              <Typography>
                Namespace :{' '}
                <span
                  className={classes.infoHint}
                  data-cy="infoWorkflowNamespace"
                >
                  {
                    YAML.parse(
                      data?.listWorkflows.workflows[0].workflowManifest
                    ).metadata.namespace
                  }
                </span>
              </Typography>
            )}
          </div>

          {/* Column 2 */}
          <div>
            <Typography className={classes.infoHeader}>
              Chaos Delegate :
            </Typography>
            <Typography>
              Name :{' '}
              <span className={classes.infoHint} data-cy="infoAgentName">
                {data.listWorkflows.workflows[0].clusterName}
              </span>
            </Typography>
            <Typography>
              Id :{' '}
              <span className={classes.infoHint} data-cy="infoClusterId">
                {data.listWorkflows.workflows[0].clusterID}
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
                  data.listWorkflows.workflows[0].updatedAt
                )}
              </span>
            </Typography>
            <Typography data-cy="infoWorkflowNextRun">
              Next Run :{' '}
              {data.listWorkflows.workflows[0].cronSyntax ? (
                <span className={classes.infoHint}>
                  {parser
                    .parseExpression(data.listWorkflows.workflows[0].cronSyntax)
                    .next()
                    .toString()}
                </span>
              ) : (
                <span className={classes.infoHint}>
                  Non Cron Chaos Scenario
                </span>
              )}
            </Typography>
          </div>
          {/* Column 4 */}
          <div className={classes.regularity} data-cy="infoWorkflowRegularity">
            <Typography className={classes.infoHeader}>Regularity :</Typography>
            {data.listWorkflows.workflows[0].cronSyntax === '' ? (
              <Typography>Non Cron Chaos Scenario</Typography>
            ) : (
              data.listWorkflows.workflows[0].cronSyntax !== undefined && (
                <Typography>
                  {cronstrue.toString(
                    data.listWorkflows.workflows[0].cronSyntax
                  )}
                </Typography>
              )
            )}
          </div>
        </div>
        {showMore && (
          <WorkflowStats
            workflowID={data.listWorkflows.workflows[0].workflowID}
            isCron={data.listWorkflows.workflows[0].cronSyntax !== ''}
            noOfWorkflowRuns={workflowRunLength ?? 0}
          />
        )}
      </div>
      <ButtonOutlined
        className={classes.button}
        onClick={() => setShowMore(!showMore)}
        data-cy="showStatsButton"
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
