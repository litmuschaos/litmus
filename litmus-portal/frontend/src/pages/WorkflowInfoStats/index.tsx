import { useQuery } from '@apollo/client';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@material-ui/core';
import parser from 'cron-parser';
import cronstrue from 'cronstrue';
import { ButtonFilled, CalendarHeatmap } from 'litmus-ui';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import YAML from 'yaml';
import BackButton from '../../components/Button/BackButton';
import Center from '../../containers/layouts/Center';
import Scaffold from '../../containers/layouts/Scaffold';
import { GET_HEATMAP_DATA, WORKFLOW_LIST_DETAILS } from '../../graphql/queries';
import {
  HeatmapDataResponse,
  HeatmapDataVars,
} from '../../models/graphql/workflowData';
import {
  ListWorkflowsInput,
  ScheduledWorkflows,
} from '../../models/graphql/workflowListData';
import timeDifferenceForDate from '../../utils/datesModifier';
import { getProjectID } from '../../utils/getSearchParams';
import StackedBarGraph from './StackedBar';
import useStyles from './styles';
import { TestCalendarHeatmapTooltip } from './testData';

interface URLParams {
  workflowRunId: string;
}

const valueThreshold = [13, 26, 39, 49, 59, 69, 79, 89, 100];

const WorkflowInfoStats: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
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

  const presentYear = new Date().getFullYear();

  const [year, setYear] = useState<number>(presentYear);

  // Apollo query to get the heatmap data
  const { data: heatmapData } = useQuery<HeatmapDataResponse, HeatmapDataVars>(
    GET_HEATMAP_DATA,
    {
      variables: {
        project_id: projectID,
        workflow_id: workflowRunId,
        year,
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const yearArray = [presentYear, presentYear - 1, presentYear - 2];

  const [showStackBar, setShowStackBar] = useState<boolean>(false);
  const [dataCheck, setDataCheck] = useState<boolean>(false);

  const [workflowRunDate, setworkflowRunDate] = useState<number>(0);

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
              Total Runs : {/* Replace with LIST_API */}
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
        <div className={classes.heatmapAreaHeading}>
          <Typography className={classes.sectionHeading}>Analytics</Typography>
          {/* Year selection filter */}
        </div>
        <div className={classes.heatmap}>
          <div className={classes.heatmapBorder}>
            <div className={classes.formControlParent}>
              <Typography>
                Total runs till date:{' '}
                {data?.ListWorkflow.workflows[0].workflow_runs?.length}
              </Typography>
              <FormControl variant="outlined" focused>
                <InputLabel />
                <Select
                  value={year}
                  onChange={(event) => {
                    setYear(event.target.value as number);
                  }}
                >
                  {yearArray.map((selectedYear) => (
                    <MenuItem value={selectedYear}>{selectedYear}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div
              style={{
                width: '60rem',
                height: '10rem',
              }}
            >
              <CalendarHeatmap
                calendarHeatmapMetric={heatmapData?.getHeatmapData ?? []}
                valueThreshold={valueThreshold}
                CalendarHeatmapTooltip={TestCalendarHeatmapTooltip}
                handleBinClick={(bin) => {
                  if (bin.bin.workflowRunDetail.no_of_runs) {
                    setShowStackBar(!showStackBar);
                    setDataCheck(false);
                    setworkflowRunDate(bin.bin.workflowRunDetail.date_stamp);
                  } else {
                    setDataCheck(true);
                    setShowStackBar(false);
                    setworkflowRunDate(0);
                  }
                }}
              />
            </div>
          </div>
          {showStackBar && (
            <StackedBarGraph
              workflowID={workflowRunId}
              date={workflowRunDate}
            />
          )}
          {dataCheck && !showStackBar && (
            <div className={classes.noData}>
              <Center>
                <Typography>No data to display</Typography>
              </Center>
            </div>
          )}
        </div>
      </div>
    </Scaffold>
  );
};

export default WorkflowInfoStats;
