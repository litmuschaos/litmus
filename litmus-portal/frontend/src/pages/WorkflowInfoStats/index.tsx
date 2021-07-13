import { useQuery } from '@apollo/client';
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
  workflowRunId: string;
}

const valueThreshold = [13, 26, 39, 49, 59, 69, 79, 89, 100];

const WorkflowInfoStats: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();

  // TODO: This is actually workflowID NOT run ID, fix in app.tsx
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

  let workflowRunID = '';

  if (data?.ListWorkflow.workflows[0].workflow_runs) {
    workflowRunID =
      data?.ListWorkflow?.workflows[0].workflow_runs[0].workflow_run_id;
  }

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
  >(GET_HEATMAP_DATA, {
    variables: {
      project_id: projectID,
      workflow_id: workflowRunId,
      year,
    },
    fetchPolicy: 'cache-and-network',
  });

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
        {/* For later: */}
        {/* <div>
          <ButtonFilled onClick={() => {}}>PDF</ButtonFilled>
        </div> */}
      </div>

      {/* Information and stats */}
      {data && <InfoSection data={data} />}

      {/* Visulization Area */}
      {/* Check for cron workflow OR single workflow which has been re-run */}
      {data?.ListWorkflow.workflows[0].cronSyntax !== '' ||
      (data?.ListWorkflow.workflows[0].workflow_runs?.length &&
        data?.ListWorkflow.workflows[0].workflow_runs?.length > 1) ? (
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
                {data?.ListWorkflow.workflows[0].workflow_runs?.length}
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
                    setworkflowRunDate(0);
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
                        setworkflowRunDate(
                          bin.bin.workflowRunDetail.date_stamp
                        );
                      }
                    } else {
                      setShowStackBar(false);
                      setDataCheck(false);
                      handleTableClose();
                      setworkflowRunDate(0);
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
              workflowID={workflowRunId}
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
          workflowId={workflowRunId}
          workflowRunId={workflowRunID}
        />
      )}
    </Scaffold>
  );
};

export default WorkflowInfoStats;
