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
import {
  GET_CLUSTER_NAMES,
  WORKFLOW_DETAILS,
  WORKFLOW_EVENTS,
} from '../../../graphql';
import { Clusters, ClusterVars } from '../../../models/graphql/clusterData';
import {
  Pagination,
  SortInput,
  Workflow,
  WorkflowDataVars,
  WorkflowRun,
  WorkflowRunFilterInput,
  WorkflowStatus,
  WorkflowSubscription,
  WorkflowSubscriptionInput,
} from '../../../models/graphql/workflowData';
import { getProjectID } from '../../../utils/getSearchParams';
import HeaderSection from './HeaderSection';
import useStyles from './styles';
import TableData from './TableData';

const BrowseWorkflow: React.FC = () => {
  const classes = useStyles();
  const projectID = getProjectID();
  const { t } = useTranslation();

  // State for pagination
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 10,
  });

  // States for filters
  const [filters, setFilters] = useState<WorkflowRunFilterInput>({
    workflow_name: '',
    cluster_name: 'All',
    workflow_status: 'All',
    date_range: {
      start_date: new Date(0).valueOf().toString(),
    },
  });

  // State for date to be displayed
  const [displayDate, setDisplayDate] = React.useState<string>(
    t('chaosWorkflows.browseWorkflows.dateFilterHelperText')
  );

  // State for sorting
  const [sortData, setSortData] = useState<SortInput>({
    field: 'Time',
    descending: true,
  });

  // Checks if the workflow event from subscription exists in the table
  function isFiltered(newWorkflow: WorkflowRun) {
    const nameExists =
      filters.workflow_name &&
      newWorkflow.workflow_name
        .toLowerCase()
        .includes(filters.workflow_name.toLowerCase());

    const clusterExists =
      filters.cluster_name === 'All' ||
      filters.cluster_name === newWorkflow.cluster_name;

    const phaseExists =
      filters.workflow_status === 'All' ||
      filters.workflow_status === newWorkflow.phase;

    const dateExists =
      filters.date_range &&
      newWorkflow.last_updated >= filters.date_range.start_date &&
      (filters.date_range.end_date
        ? newWorkflow.last_updated < filters.date_range.end_date
        : true);

    const shouldAddNewWorkflow =
      nameExists && clusterExists && phaseExists && dateExists;

    return shouldAddNewWorkflow;
  }

  // Query to get list of Clusters
  const { data: clusterList } = useQuery<Partial<Clusters>, ClusterVars>(
    GET_CLUSTER_NAMES,
    {
      variables: {
        project_id: projectID,
      },
    }
  );

  // Query to get workflows
  const { subscribeToMore, data, error, refetch } = useQuery<
    Workflow,
    WorkflowDataVars
  >(WORKFLOW_DETAILS, {
    variables: {
      workflowRunsInput: {
        project_id: projectID,
        pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
        },
        sort: sortData,
        filter: filters,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  // Using subscription to get realtime data
  useEffect(() => {
    subscribeToMore<WorkflowSubscription, WorkflowSubscriptionInput>({
      document: WORKFLOW_EVENTS,
      variables: { projectID },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data || !prev || !prev.getWorkflowRuns)
          return prev;

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
        if (i === modifiedWorkflows.length && isFiltered(newWorkflow)) {
          totalNoOfWorkflows++;
          modifiedWorkflows.unshift(newWorkflow);
        }

        return {
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

  const workflowRuns = data?.getWorkflowRuns.workflow_runs;

  // Functions passed as props in the headerSection
  const changeSearch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFilters({ ...filters, workflow_name: event.target.value as string });
    setPaginationData({ ...paginationData, page: 0 });
  };

  const changeStatus = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setFilters({
      ...filters,
      workflow_status: event.target.value as WorkflowStatus,
    });
    setPaginationData({ ...paginationData, page: 0 });
  };

  const changeCluster = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setFilters({ ...filters, cluster_name: event.target.value as string });
    setPaginationData({ ...paginationData, page: 0 });
  };

  // Function to set the date range for filtering
  const dateChange = (selectStartDate: string, selectEndDate: string) => {
    // Change filter value for date range
    setFilters({
      ...filters,
      date_range: {
        start_date: new Date(selectStartDate)
          .setHours(0, 0, 0)
          .valueOf()
          .toString(),
        end_date: new Date(selectEndDate)
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
  };

  return (
    <div data-cy="WorkflowRunsTable">
      <section className="Heading section">
        {/* Header Section */}
        <HeaderSection
          searchValue={filters.workflow_name}
          changeSearch={changeSearch}
          statusValue={filters.workflow_status}
          changeStatus={changeStatus}
          clusterValue={filters.cluster_name}
          changeCluster={changeCluster}
          popOverClick={handlePopOverClick}
          popOverClose={handlePopOverClose}
          isOpen={isOpen}
          clusterList={clusterList}
          popAnchorEl={popAnchorEl}
          isDateOpen={open}
          displayDate={displayDate}
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
                <TableCell />
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
              ) : workflowRuns && workflowRuns.length ? (
                workflowRuns.map((dataRow) => (
                  <TableRow
                    data-cy="WorkflowRunsTableRow"
                    key={dataRow.workflow_run_id}
                  >
                    <TableData data={dataRow} refetchQuery={refetch} />
                  </TableRow>
                ))
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
          rowsPerPageOptions={[10, 25, 50]}
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
