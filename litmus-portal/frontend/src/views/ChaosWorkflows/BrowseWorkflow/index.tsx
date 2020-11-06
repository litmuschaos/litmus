import { useQuery } from '@apollo/client';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { WORKFLOW_DETAILS, WORKFLOW_EVENTS } from '../../../graphql';
import {
  ExecutionData,
  Workflow,
  WorkflowDataVars,
  WorkflowRun,
  WorkflowSubscription,
} from '../../../models/graphql/workflowData';
import { RootState } from '../../../redux/reducers';
import {
  sortAlphaAsc,
  sortAlphaDesc,
  sortNumAsc,
  sortNumDesc,
} from '../../../utils/sort';
import HeaderSection from './HeaderSection';
import useStyles from './styles';
import TableData from './TableData';

interface FilterOptions {
  search: string;
  status: string;
  cluster: string;
}

interface PaginationData {
  pageNo: number;
  rowsPerPage: number;
}

interface SortData {
  lastRun: { sort: boolean; ascending: boolean };
  name: { sort: boolean; ascending: boolean };
  noOfSteps: { sort: boolean; ascending: boolean };
}

interface DateData {
  dateValue: string;
  fromDate: string;
  toDate: string;
}

const BrowseWorkflow = () => {
  const classes = useStyles();
  const selectedProjectID = useSelector(
    (state: RootState) => state.userData.selectedProjectID
  );

  // Query to get workflows
  const { subscribeToMore, data, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: { projectID: selectedProjectID },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Using subscription to get realtime data
  useEffect(() => {
    subscribeToMore<WorkflowSubscription>({
      document: WORKFLOW_EVENTS,
      variables: { projectID: selectedProjectID },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const modifiedWorkflows = prev.getWorkFlowRuns.slice();
        const newWorkflow = subscriptionData.data.workflowEventListener;

        // Updating the query data
        let i = 0;
        for (; i < modifiedWorkflows.length; i++) {
          if (
            modifiedWorkflows[i].workflow_run_id === newWorkflow.workflow_run_id
          ) {
            modifiedWorkflows[i] = newWorkflow;
            break;
          }
        }
        if (i === modifiedWorkflows.length)
          modifiedWorkflows.unshift(newWorkflow);

        return { ...prev, getWorkFlowRuns: modifiedWorkflows };
      },
    });
  }, [data]);

  // States for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'All',
    cluster: 'All',
  });

  // State for sorting
  const [sortData, setSortData] = useState<SortData>({
    lastRun: { sort: true, ascending: true },
    name: { sort: false, ascending: true },
    noOfSteps: { sort: false, ascending: false },
  });

  // State for pagination
  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });

  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const isOpen = Boolean(popAnchorEl);

  const [open, setOpen] = React.useState<boolean>(false);

  const handlePopOverClose = () => {
    setPopAnchorEl(null);
    setOpen(false);
  };
  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
    setOpen(true);
  };

  // State for start date and end date
  const [dateRange, setDateRange] = React.useState<DateData>({
    dateValue: 'Select a period',
    fromDate: new Date(0).toString(),
    toDate: new Date(new Date().setHours(23, 59, 59)).toString(),
  });

  const getClusters = (searchingData: WorkflowRun[]) => {
    const uniqueList: string[] = [];
    searchingData.forEach((data) => {
      if (!uniqueList.includes(data.cluster_name)) {
        uniqueList.push(data.cluster_name);
      }
    });
    return uniqueList;
  };

  const filteredData = data?.getWorkFlowRuns
    .filter((dataRow) =>
      dataRow.workflow_name.toLowerCase().includes(filters.search.toLowerCase())
    )
    .filter((dataRow) =>
      filters.status === 'All'
        ? true
        : (JSON.parse(dataRow.execution_data) as ExecutionData).phase.includes(
            filters.status
          )
    )
    .filter((dataRow) =>
      filters.cluster === 'All'
        ? true
        : dataRow.cluster_name
            .toLowerCase()
            .includes(filters.cluster.toLowerCase())
    )
    .filter((dataRow) => {
      return dateRange.fromDate && dateRange.toDate === undefined
        ? true
        : parseInt(dataRow.last_updated, 10) * 1000 >=
            new Date(moment(dateRange.fromDate).format()).getTime() &&
            parseInt(dataRow.last_updated, 10) * 1000 <=
              new Date(moment(dateRange.toDate).format()).getTime();
    })
    .sort((a: WorkflowRun, b: WorkflowRun) => {
      // Sorting based on unique fields
      if (sortData.name.sort) {
        const x = a.workflow_name;
        const y = b.workflow_name;

        return sortData.name.ascending
          ? sortAlphaAsc(x, y)
          : sortAlphaDesc(x, y);
      }

      if (sortData.lastRun.sort) {
        const x = parseInt(a.last_updated, 10);
        const y = parseInt(b.last_updated, 10);

        return sortData.lastRun.ascending
          ? sortNumAsc(y, x)
          : sortNumDesc(y, x);
      }

      return 0;
    })
    .sort((a: WorkflowRun, b: WorkflowRun) => {
      // Sorting based on non-unique fields
      if (sortData.noOfSteps.sort) {
        const x = Object.keys(
          (JSON.parse(a.execution_data) as ExecutionData).nodes
        ).length;

        const y = Object.keys(
          (JSON.parse(b.execution_data) as ExecutionData).nodes
        ).length;

        return sortData.noOfSteps.ascending
          ? sortNumAsc(x, y)
          : sortNumDesc(x, y);
      }

      return 0;
    });

  // Functions passed as props in the headerSeaction
  const changeSearch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFilters({ ...filters, search: event.target.value as string });
    setPaginationData({ ...paginationData, pageNo: 0 });
  };

  const changeStatus = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setFilters({ ...filters, status: event.target.value as string });
    setPaginationData({ ...paginationData, pageNo: 0 });
  };

  const changeCluster = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setFilters({ ...filters, cluster: event.target.value as string });
    setPaginationData({ ...paginationData, pageNo: 0 });
  };

  // Function to set the date range for filtering
  const dateChange = (selectFromDate: string, selectToDate: string) => {
    setDateRange({
      dateValue: `${moment(selectFromDate)
        .format('DD.MM.YYYY')
        .toString()}-${moment(selectToDate).format('DD.MM.YYYY').toString()}`,
      fromDate: new Date(new Date(selectFromDate).setHours(0, 0, 0)).toString(),
      toDate: new Date(new Date(selectToDate).setHours(23, 59, 59)).toString(),
    });
  };
  // Function to validate execution_data JSON
  const dataPerRow = (dataRow: WorkflowRun) => {
    let exe_data;
    try {
      exe_data = JSON.parse(dataRow.execution_data);
    } catch (error) {
      console.error(error);
      return <></>;
    }
    return (
      <TableRow data-cy="browseWorkflowData" key={dataRow.workflow_run_id}>
        <TableData data={dataRow} exeData={exe_data} />
      </TableRow>
    );
  };

  return (
    <div>
      <section className="Heading section">
        {/* Header Section */}
        <HeaderSection
          searchValue={filters.search}
          changeSearch={changeSearch}
          statusValue={filters.status}
          changeStatus={changeStatus}
          clusterValue={filters.cluster}
          changeCluster={changeCluster}
          popOverClick={handlePopOverClick}
          popOverClose={handlePopOverClose}
          isOpen={isOpen}
          data={data}
          getClusters={getClusters}
          popAnchorEl={popAnchorEl}
          isDateOpen={open}
          displayDate={dateRange.dateValue}
          selectDate={dateChange}
        />
      </section>
      <Paper className={classes.root}>
        <TableContainer
          data-cy="browseWorkflowTable"
          className={classes.tableMain}
        >
          <Table stickyHeader aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                {/* Status */}
                <TableCell className={classes.headerStatus}>Status</TableCell>

                {/* Workflow Name */}
                <TableCell className={classes.workflowName}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography className={classes.paddedTypography}>
                      Workflow Name
                    </Typography>
                    <div className={classes.sortDiv}>
                      <IconButton
                        aria-label="sort name ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            name: { sort: true, ascending: true },
                            lastRun: { sort: false, ascending: true },
                          })
                        }
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort name descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            name: { sort: true, ascending: false },
                            lastRun: { sort: false, ascending: false },
                          })
                        }
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Target Cluster */}
                <TableCell>
                  <Typography className={classes.targetCluster}>
                    Target Cluster
                  </Typography>
                </TableCell>

                {/* Reliability */}
                <TableCell className={classes.headData}>
                  Reliability Details
                </TableCell>

                {/* No of Experiments */}
                <TableCell className={classes.headData}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography className={classes.paddedTypography}>
                      # of Steps
                    </Typography>
                    <div className={classes.sortDiv}>
                      <IconButton
                        aria-label="sort no of steps ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            noOfSteps: { sort: true, ascending: true },
                          })
                        }
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort no of steps descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            noOfSteps: { sort: true, ascending: false },
                          })
                        }
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Last Run */}
                <TableCell className={classes.headData}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography className={classes.paddedTypography}>
                      Last Run
                    </Typography>
                    <div className={classes.sortDiv}>
                      <IconButton
                        aria-label="sort last run ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            lastRun: { sort: true, ascending: true },
                            name: { sort: false, ascending: true },
                          })
                        }
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="sort last run descending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            ...sortData,
                            lastRun: { sort: true, ascending: false },
                            name: { sort: false, ascending: true },
                          })
                        }
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Menu Cell */}
                <TableCell />
              </TableRow>
            </TableHead>

            {/* Body */}
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography data-cy="browseWorkflowError" align="center">
                      Unable to fetch data
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData && filteredData.length ? (
                filteredData
                  .slice(
                    paginationData.pageNo * paginationData.rowsPerPage,
                    paginationData.pageNo * paginationData.rowsPerPage +
                      paginationData.rowsPerPage
                  )
                  .map((dataRow) => dataPerRow(dataRow))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography data-cy="browseWorkflowNoData" align="center">
                      No records available
                    </Typography>
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
          count={filteredData?.length ?? 0}
          rowsPerPage={paginationData.rowsPerPage}
          page={paginationData.pageNo}
          onChangePage={(_, page) =>
            setPaginationData({ ...paginationData, pageNo: page })
          }
          onChangeRowsPerPage={(event) =>
            setPaginationData({
              ...paginationData,
              pageNo: 0,
              rowsPerPage: parseInt(event.target.value, 10),
            })
          }
        />
      </Paper>
    </div>
  );
};

export default BrowseWorkflow;
