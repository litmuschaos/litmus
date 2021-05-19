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
import { useTranslation } from 'react-i18next';
import { WORKFLOW_DETAILS, WORKFLOW_EVENTS } from '../../../graphql';
import {
  ExecutionData,
  Pagination,
  SortInput,
  Workflow,
  WorkflowDataVars,
  WorkflowRun,
  WorkflowSubscription,
} from '../../../models/graphql/workflowData';
import { getProjectID } from '../../../utils/getSearchParams';
import HeaderSection from './HeaderSection';
import useStyles from './styles';
import TableData from './TableData';

interface FilterOptions {
  search: string;
  status: string;
  cluster: string;
}

interface DateData {
  dateValue: string;
  fromDate: string;
  toDate: string;
}

const BrowseWorkflow: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();
  const { t } = useTranslation();

  // State for pagination
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 5,
  });

  // States for filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'All',
    cluster: 'All',
  });

  // State for sorting
  const [sortData, setSortData] = useState<SortInput>({
    field: 'Time',
    descending: true,
  });

  // Query to get workflows
  const { subscribeToMore, data, error } = useQuery<Workflow, WorkflowDataVars>(
    WORKFLOW_DETAILS,
    {
      variables: {
        workflowRunsInput: {
          project_id: projectID,
          pagination: {
            page: paginationData.page,
            limit: paginationData.limit,
          },
          sort: sortData,
        },
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  // Using subscription to get realtime data
  useEffect(() => {
    subscribeToMore<WorkflowSubscription>({
      document: WORKFLOW_EVENTS,
      variables: {
        workflowRunsInput: {
          project_id: projectID,
        },
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const modifiedWorkflows = prev.getWorkflowRuns.workflow_runs.slice();
        const newWorkflow = subscriptionData.data.workflowEventListener;

        // Updating the query data
        let i = 0;
        let totalNoOfWorkflows = prev.getWorkflowRuns.total_no_of_workflow_runs;

        for (; i < modifiedWorkflows.length; i++) {
          if (
            modifiedWorkflows[i].workflow_run_id === newWorkflow.workflow_run_id
          ) {
            modifiedWorkflows[i] = newWorkflow;
            break;
          }
        }
        if (i === modifiedWorkflows.length) {
          totalNoOfWorkflows++;
          modifiedWorkflows.unshift(newWorkflow);
        }

        return {
          ...prev,
          getWorkflowRuns: {
            total_no_of_workflow_runs: totalNoOfWorkflows,
            workflow_runs: modifiedWorkflows,
          },
        };
      },
    });
  }, [data]);

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

  const filteredData = data?.getWorkflowRuns.workflow_runs
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
    });

  // Functions passed as props in the headerSection
  const changeSearch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFilters({ ...filters, search: event.target.value as string });
    setPaginationData({ ...paginationData, page: 0 });
  };

  const changeStatus = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setFilters({ ...filters, status: event.target.value as string });
    setPaginationData({ ...paginationData, page: 0 });
  };

  const changeCluster = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setFilters({ ...filters, cluster: event.target.value as string });
    setPaginationData({ ...paginationData, page: 0 });
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
      <TableRow data-cy="WorkflowRunsTableRow" key={dataRow.workflow_run_id}>
        <TableData data={dataRow} exeData={exe_data} />
      </TableRow>
    );
  };

  return (
    <div data-cy="WorkflowRunsTable">
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
                <TableCell className={classes.headerStatus}>
                  {t('chaosWorkflows.browseWorkflows.status')}
                </TableCell>

                {/* Workflow Name */}
                <TableCell className={classes.workflowName}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography className={classes.paddedTypography}>
                      {t('chaosWorkflows.browseWorkflows.name')}
                    </Typography>
                    <div className={classes.sortDiv}>
                      <IconButton
                        aria-label="sort name ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            field: 'Name',
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
                            field: 'Name',
                            descending: true,
                          })
                        }
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Target Agent */}
                <TableCell>
                  <Typography className={classes.targetCluster}>
                    {t('chaosWorkflows.browseWorkflows.targetAgent')}
                  </Typography>
                </TableCell>

                {/* Reliability Details */}
                <TableCell>
                  <Typography className={classes.paddedTypography}>
                    {t('chaosWorkflows.browseWorkflows.reliabilityDetails')}
                  </Typography>
                </TableCell>

                {/* Experiments */}
                <TableCell>
                  <Typography className={classes.paddedTypography}>
                    {t('chaosWorkflows.browseWorkflows.experiments')}
                  </Typography>
                </TableCell>

                {/* Last Run */}
                <TableCell>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography className={classes.paddedTypography}>
                      {t('chaosWorkflows.browseWorkflows.lastRun')}
                    </Typography>
                    <div className={classes.sortDiv}>
                      <IconButton
                        aria-label="sort last run ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            field: 'Time',
                            descending: true,
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
                            field: 'Time',
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
                filteredData.map((dataRow) => dataPerRow(dataRow))
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
          count={data?.getWorkflowRuns.total_no_of_workflow_runs ?? 0}
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
    </div>
  );
};

export default BrowseWorkflow;
