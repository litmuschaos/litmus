import { gql, useQuery } from '@apollo/client';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@material-ui/core';
import {
  ButtonFilled,
  CalendarHeatmap,
  CalendarHeatmapTooltipProps,
  Icon,
  Modal,
} from 'litmus-ui';
import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import BackButton from '../../components/Button/BackButton';
import Loader from '../../components/Loader';
import Center from '../../containers/layouts/Center';
import Wrapper from '../../containers/layouts/Wrapper';
import {
  GET_WORKFLOW_DETAILS,
  WORKFLOW_RUN_DETAILS,
} from '../../graphql/queries';
import {
  HeatmapDataRequest,
  HeatmapDataResponse,
  Workflow,
  WorkflowDataRequest,
} from '../../models/graphql/workflowData';
import {
  GetWorkflowsRequest,
  ScheduledWorkflows,
} from '../../models/graphql/workflowListData';
import { history } from '../../redux/configureStore';
import { getProjectID } from '../../utils/getSearchParams';
import { InfoSection } from './InfoSection';
import StackedBarGraph from './StackedBar';
import useStyles from './styles';
import WorkflowRunTable from './WorkflowRunTable';

const TestCalendarHeatmapTooltip = ({
  tooltipData,
}: CalendarHeatmapTooltipProps): React.ReactElement => {
  // Function to convert UNIX time in format of DD MMM YYY
  const formatDate = (date: string) => {
    const updated = new Date(parseInt(date, 10) * 1000).toString();
    const resDate = moment(updated).format('DD MMM, HH:mm');
    return resDate;
  };
  return (
    <div>
      <div style={{ marginBottom: '0.2rem' }}>
        {tooltipData?.data?.bin?.bin.value ?? 0}% Average Resiliency
      </div>
      <div>
        {tooltipData?.data?.bin?.bin.workflowRunDetail.noOfRuns ?? 0} completed
        runs on{' '}
        {formatDate(tooltipData?.data?.bin?.bin.workflowRunDetail.dateStamp) ??
          ''}
      </div>
    </div>
  );
};

interface URLParams {
  workflowID: string;
}

const valueThreshold = [13, 26, 39, 49, 59, 69, 79, 89, 100];

const WorkflowInfoStats: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();
  const { t } = useTranslation();
  const theme = useTheme();

  const { workflowID }: URLParams = useParams();

  // Keep track of whether workflow has run or not
  const [hasWorkflowRun, setHasWorkflowRun] = useState<boolean>(true);

  // Apollo query to get the scheduled workflow data
  const { data } = useQuery<ScheduledWorkflows, GetWorkflowsRequest>(
    GET_WORKFLOW_DETAILS,
    {
      variables: {
        request: { projectID, workflowIDs: [workflowID] },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  // TODO: shift out
  const { data: workflowRunData } = useQuery<Workflow, WorkflowDataRequest>(
    WORKFLOW_RUN_DETAILS,
    {
      variables: {
        request: {
          projectID,
          workflowIDs: [workflowID],
        },
      },
      onCompleted: () => {
        setHasWorkflowRun(
          workflowRunData !== undefined &&
            workflowRunData.listWorkflowRuns.totalNoOfWorkflowRuns > 0
        );
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const workflowRunID =
    workflowRunData?.listWorkflowRuns?.workflowRuns[0]?.workflowRunID ?? '';

  const presentYear = new Date().getFullYear();
  const [showTable, setShowTable] = useState<boolean>(false);

  const [year, setYear] = useState<number>(presentYear);

  const handleTableOpen = () => {
    setShowTable(true);
  };

  const handleTableClose = () => {
    setShowTable(false);
  };

  // TODO: shift out
  // Apollo query to get the heatmap data
  const { data: heatmapData, loading } = useQuery<
    HeatmapDataResponse,
    HeatmapDataRequest
  >(
    gql`
      query listHeatmapData(
        $projectID: String!
        $workflowID: String!
        $year: Int!
      ) {
        listHeatmapData(
          projectID: $projectID
          workflowID: $workflowID
          year: $year
        ) {
          bins {
            value
            workflowRunDetail {
              noOfRuns
              dateStamp
            }
          }
        }
      }
    `,
    {
      variables: {
        projectID,
        workflowID,
        year,
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const yearArray = [presentYear, presentYear - 1, presentYear - 2];

  const [showStackBar, setShowStackBar] = useState<boolean>(false);
  const [dataCheck, setDataCheck] = useState<boolean>(false);

  const [workflowRunDate, setWorkflowRunDate] = useState<number>(0);

  // Used to pass down the average resiliency score to the stackbar
  const [binResiliencyScore, setBinResiliencyScore] = useState<number>(0);

  return (
    <Wrapper>
      <BackButton />
      {/* If no runs yet */}
      <Modal
        width="28.9375rem"
        height="17.25rem"
        open={!hasWorkflowRun}
        onClose={() => {
          history.goBack();
        }}
      >
        <div className={classes.noRunsModal}>
          <div className={classes.noRunsModalErrorMessage}>
            <Icon name="info" size="3xl" color={theme.palette.border.error} />
            <Typography>
              {t('observability.workflowInfoStats.noRuns')}
            </Typography>
          </div>
          <ButtonFilled
            onClick={() => {
              history.goBack();
            }}
          >
            {t('observability.workflowInfoStats.back')}
          </ButtonFilled>
        </div>
      </Modal>

      {/* Heading of the Page */}
      <div className={classes.headingSection}>
        <div className={classes.pageHeading}>
          <Typography className={classes.heading} data-cy="statsWorkflowName">
            {data?.listWorkflows.workflows[0].workflowName}
          </Typography>
          <Typography className={classes.subHeading}>
            Here’s the statistics of the selected Chaos Scenario
          </Typography>
        </div>
        {/* For later: */}
        {/* <div>
          <ButtonFilled onClick={() => {}}>PDF</ButtonFilled>
        </div> */}
      </div>

      {/* Information and stats */}
      {data && workflowRunData && (
        <InfoSection
          data={data}
          workflowRunLength={
            workflowRunData.listWorkflowRuns.totalNoOfWorkflowRuns
          }
        />
      )}

      {/* Visulization Area */}
      {/* Check for cron workflow OR single workflow which has been re-run */}
      {data?.listWorkflows.workflows[0].cronSyntax !== '' ||
      (workflowRunData?.listWorkflowRuns.totalNoOfWorkflowRuns &&
        workflowRunData?.listWorkflowRuns.totalNoOfWorkflowRuns > 1) ? (
        <div className={classes.heatmapArea}>
          <div className={classes.heatmapAreaHeading}>
            <Typography className={classes.sectionHeading}>
              Statistics
            </Typography>
            {/* Year selection filter */}
          </div>
          <div className={classes.heatmapBorder}>
            <div className={classes.formControlParent}>
              <Typography>
                Total runs till date:{' '}
                {workflowRunData?.listWorkflowRuns.totalNoOfWorkflowRuns}
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
                <div className={classes.heatmapParent} data-cy="statsHeatMap">
                  <CalendarHeatmap
                    calendarHeatmapMetric={heatmapData?.listHeatmapData ?? []}
                    valueThreshold={valueThreshold}
                    CalendarHeatmapTooltip={TestCalendarHeatmapTooltip}
                    handleBinClick={(bin: any) => {
                      if (bin) {
                        if (bin?.bin?.workflowRunDetail.noOfRuns === 0) {
                          setDataCheck(true);
                          setShowStackBar(false);
                          handleTableClose();
                        } else {
                          setShowStackBar(true);
                          handleTableClose();
                          setBinResiliencyScore(bin.bin.value);
                          setWorkflowRunDate(
                            bin.bin.workflowRunDetail.dateStamp
                          );
                        }
                      } else {
                        setShowStackBar(false);
                        setDataCheck(false);
                        handleTableClose();
                        setWorkflowRunDate(0);
                        setBinResiliencyScore(0);
                      }
                    }}
                  />
                </div>
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
              date={workflowRunDate}
              averageResiliency={binResiliencyScore}
              workflowID={workflowID}
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
          workflowID={workflowID}
          workflowRunID={workflowRunID}
        />
      )}
    </Wrapper>
  );
};

export default WorkflowInfoStats;
