import { gql, useQuery } from '@apollo/client';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { CalendarHeatmap, CalendarHeatmapTooltipProps } from 'litmus-ui';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import Center from '../../containers/layouts/Center';
import Wrapper from '../../containers/layouts/Wrapper';
import { WORKFLOW_LIST_DETAILS } from '../../graphql/queries';
import {
  HeatmapDataResponse,
  HeatmapDataVars,
  Workflow,
  WorkflowDataVars,
} from '../../models/graphql/workflowData';
import {
  ListWorkflowsInput,
  ScheduledWorkflows,
} from '../../models/graphql/workflowListData';
import { getProjectID } from '../../utils/getSearchParams';
import { InfoSection } from './InfoSection';
import StackedBarGraph from './StackedBar';
import useStyles from './styles';
import WorkflowRunTable from './WorkflowRunTable';

const TestCalendarHeatmapTooltip = ({
  tooltipData,
}: CalendarHeatmapTooltipProps): React.ReactElement => {
  return (
    <div>
      <div style={{ marginBottom: '0.2rem' }}>
        {tooltipData?.data?.bin?.bin.value ?? 0}% Average Resiliency
      </div>
      <div>
        {tooltipData?.data?.bin?.bin.workflowRunDetail.no_of_runs ?? 0} runs
      </div>
    </div>
  );
};

interface URLParams {
  workflowId: string;
}

const valueThreshold = [13, 26, 39, 49, 59, 69, 79, 89, 100];

const WorkflowInfoStats: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();

  const { workflowId }: URLParams = useParams();

  // Apollo query to get the scheduled workflow data
  const { data } = useQuery<ScheduledWorkflows, ListWorkflowsInput>(
    WORKFLOW_LIST_DETAILS,
    {
      variables: {
        workflowInput: { project_id: projectID, workflow_ids: [workflowId] },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const { data: workflowRunData } = useQuery<Workflow, WorkflowDataVars>(
    gql`
      query workflowDetails($workflowRunsInput: GetWorkflowRunsInput!) {
        getWorkflowRuns(workflowRunsInput: $workflowRunsInput) {
          total_no_of_workflow_runs
          workflow_runs {
            workflow_run_id
          }
        }
      }
    `,
    {
      variables: {
        workflowRunsInput: {
          project_id: projectID,
          workflow_ids: [workflowId],
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const workflowRunID =
    workflowRunData?.getWorkflowRuns.workflow_runs[0].workflow_run_id ?? '';

  const presentYear = new Date().getFullYear();
  const [showTable, setShowTable] = useState<boolean>(false);

  const [year, setYear] = useState<number>(presentYear);

  const handleTableOpen = () => {
    setShowTable(true);
  };

  const handleTableClose = () => {
    setShowTable(false);
  };

  // Apollo query to get the heatmap data
  const { data: heatmapData, loading } = useQuery<
    HeatmapDataResponse,
    HeatmapDataVars
  >(
    gql`
      query getHeatmapData(
        $project_id: String!
        $workflow_id: String!
        $year: Int!
      ) {
        getHeatmapData(
          project_id: $project_id
          workflow_id: $workflow_id
          year: $year
        ) {
          bins {
            value
            workflowRunDetail {
              no_of_runs
              date_stamp
            }
          }
        }
      }
    `,
    {
      variables: {
        project_id: projectID,
        workflow_id: workflowId,
        year,
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const yearArray = [presentYear, presentYear - 1, presentYear - 2];

  const [showStackBar, setShowStackBar] = useState<boolean>(false);
  const [dataCheck, setDataCheck] = useState<boolean>(false);

  const [workflowRunDate, setWorkflowRunDate] = useState<number>(0);

  return (
    <Wrapper>
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
        {/* For later: */}
        {/* <div>
          <ButtonFilled onClick={() => {}}>PDF</ButtonFilled>
        </div> */}
      </div>

      {/* Information and stats */}
      {data && workflowRunData?.getWorkflowRuns.total_no_of_workflow_runs && (
        <InfoSection
          data={data}
          workflowRunLength={
            workflowRunData.getWorkflowRuns.total_no_of_workflow_runs
          }
        />
      )}

      {/* Visulization Area */}
      {/* Check for cron workflow OR single workflow which has been re-run */}
      {data?.ListWorkflow.workflows[0].cronSyntax !== '' ||
      (workflowRunData?.getWorkflowRuns.total_no_of_workflow_runs &&
        workflowRunData?.getWorkflowRuns.total_no_of_workflow_runs > 1) ? (
        <div className={classes.heatmapArea}>
          <div className={classes.heatmapAreaHeading}>
            <Typography className={classes.sectionHeading}>
              Analytics
            </Typography>
            {/* Year selection filter */}
          </div>
          <div className={classes.heatmapBorder}>
            <div className={classes.formControlParent}>
              <Typography>
                Total runs till date:{' '}
                {workflowRunData?.getWorkflowRuns.total_no_of_workflow_runs}
              </Typography>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                focused
              >
                <InputLabel />
                <Select
                  value={year}
                  onChange={(event) => {
                    setYear(event.target.value as number);
                    setDataCheck(false);
                    setShowStackBar(false);
                    setWorkflowRunDate(0);
                    handleTableClose();
                  }}
                >
                  {yearArray.map((selectedYear) => (
                    <MenuItem value={selectedYear}>{selectedYear}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className={classes.heatmapParent}>
              {loading ? (
                <Center>
                  <Loader />
                </Center>
              ) : (
                <CalendarHeatmap
                  calendarHeatmapMetric={heatmapData?.getHeatmapData ?? []}
                  valueThreshold={valueThreshold}
                  CalendarHeatmapTooltip={TestCalendarHeatmapTooltip}
                  handleBinClick={(bin: any) => {
                    if (bin) {
                      if (bin?.bin?.workflowRunDetail.no_of_runs === 0) {
                        setDataCheck(true);
                        setShowStackBar(false);
                        handleTableClose();
                      } else {
                        setShowStackBar(true);
                        handleTableClose();
                        setWorkflowRunDate(
                          bin.bin.workflowRunDetail.date_stamp
                        );
                      }
                    } else {
                      setShowStackBar(false);
                      setDataCheck(false);
                      handleTableClose();
                      setWorkflowRunDate(0);
                    }
                  }}
                />
              )}
            </div>
            {/* Legend */}
            <div className={classes.heatmapLegend}>
              <Typography>Resiliency:</Typography>
              <Typography className={classes.infoHint}>Less</Typography>
              <img
                src="./icons/resiliencyScoreIndicators.svg"
                alt="score legend"
              />
              <Typography className={classes.infoHint}>More</Typography>
            </div>
          </div>
          {showStackBar && (
            <StackedBarGraph
              workflowID={workflowId}
              date={workflowRunDate}
              handleTableOpen={handleTableOpen}
              handleTableClose={handleTableClose}
              showTable={showTable}
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
      ) : (
        <WorkflowRunTable
          workflowId={workflowId}
          workflowRunId={workflowRunID}
        />
      )}
    </Wrapper>
  );
};

export default WorkflowInfoStats;
