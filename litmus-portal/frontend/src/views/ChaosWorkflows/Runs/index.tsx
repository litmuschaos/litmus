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
import { ClusterRequest, Clusters } from '../../../models/graphql/clusterData';
import {
  Pagination,
  SortRequest,
  Workflow,
  WorkflowDataRequest,
  WorkflowRun,
  WorkflowRunFilterRequest,
  WorkflowStatus,
  WorkflowSubscription,
  WorkflowSubscriptionRequest,
} from '../../../models/graphql/workflowData';
import { getProjectID } from '../../../utils/getSearchParams';
import HeaderSection from './HeaderSection';
import useStyles from './styles';
import TableData from './TableData';

interface BrowseWorkflowProps {
  workflowName: string;
  setWorkflowName: React.Dispatch<React.SetStateAction<string>>;
}

const BrowseWorkflow: React.FC<BrowseWorkflowProps> = ({
  workflowName,
  setWorkflowName,
}) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const { t } = useTranslation();

  // State for pagination
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 10,
  });

  // States for filters
  const [filters, setFilters] = useState<WorkflowRunFilterRequest>({
    workflowName,
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

  // State for sorting
  const [sortData, setSortData] = useState<SortRequest>({
    field: 'TIME',
    descending: true,
  });

  // Checks if the workflow event from subscription exists in the table
  function isFiltered(newWorkflow: WorkflowRun) {
    const nameExists =
      filters.workflowName &&
      newWorkflow.workflowName
        .toLowerCase()
        .includes(filters.workflowName.toLowerCase());

    const clusterExists =
      filters.clusterName === 'All' ||
      filters.clusterName === newWorkflow.clusterName;

    const phaseExists =
      filters.workflowStatus === 'All' ||
      filters.workflowStatus === newWorkflow.phase;

    const dateExists =
      filters.dateRange &&
      newWorkflow.lastUpdated >= filters.dateRange.startDate &&
      (filters.dateRange.endDate
        ? newWorkflow.lastUpdated < filters.dateRange.endDate
        : true);

    const shouldAddNewWorkflow =
      nameExists && clusterExists && phaseExists && dateExists;

    return shouldAddNewWorkflow;
  }

  // Query to get list of Clusters
  const { data: clusterList } = useQuery<Partial<Clusters>, ClusterRequest>(
    GET_CLUSTER_NAMES,
    {
      variables: {
        projectID,
      },
    }
  );

  // Query to get workflows
  const { subscribeToMore, data, error, refetch } = useQuery<
    Workflow,
    WorkflowDataRequest
  >(WORKFLOW_DETAILS, {
    variables: {
      request: {
        projectID,
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
    subscribeToMore<WorkflowSubscription, WorkflowSubscriptionRequest>({
      document: WORKFLOW_EVENTS,
      variables: { projectID },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data || !prev || !prev.listWorkflowRuns)
          return prev;

        const modifiedWorkflows = prev.listWorkflowRuns.workflowRuns.slice();
        const newWorkflow = subscriptionData.data.getWorkflowEvents;
        // Updating the query data
        let i = 0;
        let totalNoOfWorkflows = prev.listWorkflowRuns.totalNoOfWorkflowRuns;

        for (; i < modifiedWorkflows.length; i++) {
          if (
            modifiedWorkflows[i].workflowRunID === newWorkflow.workflowRunID
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
          listWorkflowRuns: {
            totalNoOfWorkflowRuns: totalNoOfWorkflows,
            workflowRuns: modifiedWorkflows,
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

  const workflowRuns = data?.listWorkflowRuns.workflowRuns;
  // Functions passed as props in the headerSection
  const changeSearch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFilters({ ...filters, workflowName: event.target.value as string });
    setWorkflowName(event.target.value as string);
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
      workflowStatus: event.target.value as WorkflowStatus,
    });
    setPaginationData({ ...paginationData, page: 0 });
  };

  const changeCluster = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>
  ) => {
    setFilters({ ...filters, clusterName: event.target.value as string });
    setPaginationData({ ...paginationData, page: 0 });
  };

  // Function to set the date range for filtering
  const dateChange = (selectStartDate: string, selectEndDate: string) => {
    // Change filter value for date range
    setFilters({
      ...filters,
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
  };

  return (
    <div data-cy="WorkflowRunsTable">
      <section className="Heading section">
        {/* Header Section */}
        <HeaderSection
          searchValue={filters.workflowName}
          changeSearch={changeSearch}
          statusValue={filters.workflowStatus}
          changeStatus={changeStatus}
          clusterValue={filters.clusterName}
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
                            field: 'NAME',
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
                            field: 'NAME',
                            descending: true,
                          })
                        }
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Chaos Delegate */}
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
                            field: 'TIME',
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
                            field: 'TIME',
                          })
                        }
                      >
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>

                {/* Executed By */}
                <TableCell>
                  <Typography className={classes.executedBy}>
                    {t('chaosWorkflows.browseWorkflows.executedBy')}
                  </Typography>
                </TableCell>

                {/* Menu Cell */}
                <TableCell />
              </TableRow>
            </TableHead>

            {/* Body */}
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography data-cy="browseWorkflowError" align="center">
                      Unable to fetch data
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : workflowRuns && workflowRuns.length ? (
                workflowRuns.map((dataRow) => (
                  <TableRow
                    data-cy={dataRow.workflowName}
                    key={dataRow.workflowRunID}
                  >
                    <TableData data={dataRow} refetchQuery={refetch} />
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9}>
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
          count={data?.listWorkflowRuns.totalNoOfWorkflowRuns ?? 0}
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
