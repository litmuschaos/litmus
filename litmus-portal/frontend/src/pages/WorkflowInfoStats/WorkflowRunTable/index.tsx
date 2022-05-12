import { useQuery } from '@apollo/client';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import moment from 'moment';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import Center from '../../../containers/layouts/Center';
import { GET_WORKFLOW_DETAILS, WORKFLOW_RUN_DETAILS } from '../../../graphql';
import {
  ExecutionData,
  Pagination,
  Workflow,
  WorkflowDataRequest,
  WorkflowRunFilterRequest,
} from '../../../models/graphql/workflowData';
import {
  GetWorkflowsRequest,
  ScheduledWorkflows,
  WeightageMap,
} from '../../../models/graphql/workflowListData';
import { getProjectID } from '../../../utils/getSearchParams';
import { sortNumAsc, sortNumDesc } from '../../../utils/sort';
import useStyles from './styles';
import TableData from './TableData';
import TableHeader from './TableHeader';
import TableToolBar from './TableToolbar';

interface SortData {
  lastRun: { sort: boolean; ascending: boolean };
  resultingPoint: { sort: boolean; ascending: boolean };
  testWeight: { sort: boolean; ascending: boolean };
}

interface Filter {
  selectedTest: string;
  sortData: SortData;
  selectedTestResult: string;
  context: string;
  searchTokens: string[];
}

interface WorkFlowTests {
  test_id: number;
  test_name: string;
  exp_name: string;
  test_result: string;
  context: string;
  test_weight: number;
  resulting_points: number;
  last_updated: string;
}

interface WorkflowRunTableProps {
  workflowID: string;
  workflowRunID: string;
}

const WorkflowRunTable: React.FC<WorkflowRunTableProps> = ({
  workflowID,
  workflowRunID,
}) => {
  // get ProjectID
  const projectID = getProjectID();
  const classes = useStyles();
  const { t } = useTranslation();

  const [wfRunData, setWfRunData] = React.useState<WorkFlowTests[]>([]);

  const [dateRange, setDateRange] = React.useState<WorkflowRunFilterRequest>({
    workflowName: '',
    clusterName: 'All',
    workflowStatus: 'All',
    dateRange: {
      startDate: new Date(0).valueOf().toString(),
    },
  });

  // State for date to be displayed
  const [displayDate, setDisplayDate] = React.useState<string>(
    t('chaosWorkflows.browseWorkflows.dateFilterHelperText')
  );

  const [filter, setFilter] = React.useState<Filter>({
    selectedTest: 'All',
    sortData: {
      resultingPoint: { sort: false, ascending: true },
      lastRun: { sort: true, ascending: false },
      testWeight: { sort: false, ascending: true },
    },
    selectedTestResult: 'All',
    context: 'All',
    searchTokens: [''],
  });

  // State for pagination
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 5,
  });

  const getTests = (searchingData: WorkFlowTests[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.test_name)) {
        uniqueList.push(data.test_name);
      }
    });
    return uniqueList;
  };

  const getTestResults = (searchingData: WorkFlowTests[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.test_result)) {
        uniqueList.push(data.test_result);
      }
    });
    return uniqueList;
  };

  const getContexts = (searchingData: WorkFlowTests[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.context)) {
        uniqueList.push(data.context);
      }
    });
    return uniqueList;
  };

  // Apollo query to get the scheduled workflow data
  const {
    data: weightageDetail,
    loading: loadWeightage,
    error: errorWeightage,
  } = useQuery<ScheduledWorkflows, GetWorkflowsRequest>(GET_WORKFLOW_DETAILS, {
    variables: {
      request: { projectID, workflowIDs: [workflowID] },
    },
  });

  const { loading: loadWfRun, error: errorWfRun } = useQuery<
    Workflow,
    WorkflowDataRequest
  >(WORKFLOW_RUN_DETAILS, {
    variables: {
      request: {
        projectID,
        workflowIDs: [workflowID],
        workflowRunIDs: [workflowRunID],
        pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
        },
        filter: dateRange,
      },
    },
    onCompleted: (data) => {
      const workflowTestsArray: WorkFlowTests[] = [];
      if (data?.listWorkflowRuns?.workflowRuns) {
        const executionData: ExecutionData = JSON.parse(
          data.listWorkflowRuns.workflowRuns[0].executionData
        );
        const { nodes } = executionData;
        let index: number = 1;
        if (executionData.finishedAt !== '') {
          for (const key of Object.keys(nodes)) {
            const node = nodes[key];
            if (node.chaosData) {
              const { chaosData } = node;
              const weightageMap: WeightageMap[] = weightageDetail
                ? weightageDetail?.listWorkflows.workflows[0]?.weightages
                : [];
              /* eslint-disable no-loop-func */
              weightageMap.forEach((weightage) => {
                if (weightage.experimentName === node.name) {
                  workflowTestsArray.push({
                    test_id: index,
                    test_name: node.name,
                    exp_name: chaosData.experimentName,
                    test_result: chaosData.experimentVerdict,
                    test_weight: weightage.weightage,
                    resulting_points:
                      chaosData.experimentVerdict === 'Pass' ||
                      chaosData.experimentVerdict === 'Fail'
                        ? (weightage.weightage *
                            parseInt(chaosData.probeSuccessPercentage, 10)) /
                          100
                        : 0,
                    last_updated: chaosData.lastUpdatedAt,
                    context: chaosData.engineContext,
                  });
                }
              });
            }
            index += 1;
          }
        }
      }
      setWfRunData(workflowTestsArray);
    },
    skip: !weightageDetail,
    fetchPolicy: 'cache-and-network',
  });

  const payload: WorkFlowTests[] = wfRunData
    ? wfRunData
        ?.filter((wkf: WorkFlowTests) => {
          return filter.searchTokens.every(
            (s: string) =>
              wkf.test_name.toLowerCase().includes(s) ||
              (wkf.test_result !== undefined
                ? wkf.test_result.toLowerCase().includes(s)
                : false)
          );
        })
        ?.filter((data) => {
          return filter.selectedTest === 'All'
            ? true
            : data.test_name === filter.selectedTest;
        })
        ?.filter((data) => {
          return filter.selectedTestResult === 'All'
            ? true
            : data.test_result === filter.selectedTestResult;
        })
        ?.filter((data) => {
          return filter.context === 'All'
            ? true
            : data.context === filter.context;
        })
        ?.sort((a: WorkFlowTests, b: WorkFlowTests) => {
          // Sorting based on unique fields
          if (filter.sortData.resultingPoint.sort) {
            const x = a.resulting_points;
            const y = b.resulting_points;

            return filter.sortData.resultingPoint.ascending
              ? sortNumAsc(x, y)
              : sortNumDesc(x, y);
          }
          if (filter.sortData.lastRun.sort) {
            const x = parseInt(a.last_updated, 10);

            const y = parseInt(b.last_updated, 10);

            return filter.sortData.lastRun.ascending
              ? sortNumAsc(y, x)
              : sortNumDesc(y, x);
          }
          if (filter.sortData.testWeight.sort) {
            const x = a.test_weight;
            const y = b.test_weight;

            return filter.sortData.testWeight.ascending
              ? sortNumAsc(y, x)
              : sortNumDesc(y, x);
          }
          return 0;
        })
    : [];

  // Function to set the date range for filtering
  const dateChange = (selectStartDate: string, selectEndDate: string) => {
    // Change filter value for date range
    setDateRange({
      ...dateRange,
      dateRange: {
        startDate: new Date(selectStartDate)
          .setHours(0, 0, 0)
          .valueOf()
          .toString(),
        endDate: new Date(selectEndDate)
          .setHours(23, 59, 59)
          .valueOf()
          .toString(),
      },
    });

    // Change the display value of date range
    setDisplayDate(
      `${moment(selectStartDate).format('DD.MM.YYYY').toString()}-${moment(
        selectEndDate
      )
        .format('DD.MM.YYYY')
        .toString()}`
    );
    setPaginationData({ ...paginationData, page: 0 });
  };

  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const isOpen = Boolean(popAnchorEl);

  const handlePopOverClose = () => {
    setPopAnchorEl(null);
  };
  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
  };

  return (
    <Paper elevation={2} className={classes.root}>
      <section className="Heading section">
        <TableToolBar
          popAnchorEl={popAnchorEl}
          popOverClick={handlePopOverClick}
          popOverClose={handlePopOverClose}
          isOpen={isOpen}
          searchToken={filter.searchTokens[0]}
          handleSearch={(
            event: React.ChangeEvent<{ value: unknown }> | undefined,
            token: string | undefined
          ) => {
            setFilter({
              ...filter,
              searchTokens: (event !== undefined
                ? ((event.target as HTMLInputElement).value as string)
                : token || ''
              )
                .toLowerCase()
                .split(' ')
                .filter((s) => s !== ''),
            });
            setPaginationData({ ...paginationData, page: 0 });
          }}
          tests={getTests(wfRunData)}
          testResults={getTestResults(wfRunData)}
          context={getContexts(wfRunData)}
          handleContextFilter={(contextName: string) => {
            setFilter({
              ...filter,
              context: contextName,
            });
            setPaginationData({ ...paginationData, page: 0 });
          }}
          callbackToSetTest={(testName: string) => {
            setFilter({
              ...filter,
              selectedTest: testName,
            });
            setPaginationData({ ...paginationData, page: 0 });
          }}
          callbackToSetResult={(testResult: string) => {
            setFilter({
              ...filter,
              selectedTestResult: testResult,
            });
            setPaginationData({ ...paginationData, page: 0 });
          }}
          displayDate={displayDate}
          selectDate={dateChange}
        />
      </section>
      <TableContainer className={classes.tableMain}>
        <Table aria-label="simple table" data-cy="statsTable">
          <TableHeader
            callBackToSort={(sortConfigurations: SortData) => {
              setFilter({
                ...filter,
                sortData: sortConfigurations,
              });
            }}
          />
          <TableBody>
            {payload.length ? (
              payload.map((data: WorkFlowTests) => {
                return (
                  <TableRow hover tabIndex={-1} key={data.test_id}>
                    <TableData data={data} />
                  </TableRow>
                );
              })
            ) : loadWeightage && loadWfRun && !errorWfRun && !errorWeightage ? (
              <Center>
                <Loader />
              </Center>
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography align="center">No records available</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={payload.length ?? 0}
        rowsPerPage={paginationData.limit}
        page={paginationData.page}
        onChangePage={(_, page) =>
          setPaginationData({ ...paginationData, page })
        }
        onChangeRowsPerPage={(event) =>
          setPaginationData({
            ...paginationData,
            page: 0,
            limit: parseInt(event.target.value, 10),
          })
        }
      />
    </Paper>
  );
};

export default WorkflowRunTable;
