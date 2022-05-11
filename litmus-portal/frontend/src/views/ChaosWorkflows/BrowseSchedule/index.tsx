import { useMutation, useQuery } from '@apollo/client';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import SearchIcon from '@material-ui/icons/Search';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import YAML from 'yaml';
import Loader from '../../../components/Loader';
import {
  DELETE_WORKFLOW,
  GET_CLUSTER_NAMES,
  GET_WORKFLOW_DETAILS,
  UPDATE_SCHEDULE,
} from '../../../graphql';
import { ClusterRequest, Clusters } from '../../../models/graphql/clusterData';
import { WeightMap } from '../../../models/graphql/createWorkflowData';
import { DeleteSchedule } from '../../../models/graphql/scheduleData';
import {
  GetWorkflowsRequest,
  Pagination,
  ScheduledWorkflow,
  ScheduledWorkflows,
  SortRequest,
  WorkflowFilterRequest,
} from '../../../models/graphql/workflowListData';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles from './styles';
import TableData from './TableData';

interface BrowseScheduleProps {
  setWorkflowName: React.Dispatch<React.SetStateAction<string>>;
}

interface FilterOption extends WorkflowFilterRequest {
  suspended?: string;
  workflowType?: string;
}

const BrowseSchedule: React.FC<BrowseScheduleProps> = ({ setWorkflowName }) => {
  const classes = useStyles();
  const projectID = getProjectID();
  const { t } = useTranslation();

  // State for pagination
  const [paginationData, setPaginationData] = useState<Pagination>({
    page: 0,
    limit: 10,
  });

  // States for filters
  const [filters, setFilters] = useState<FilterOption>({
    workflowName: '',
    clusterName: 'All',
    suspended: 'All',
    workflowType: 'All',
  });

  // State for sorting
  const [sortData, setSortData] = useState<SortRequest>({
    field: 'TIME',
    descending: true,
  });

  // Apollo query to get the scheduled data
  const { data, refetch, loading, error } = useQuery<
    ScheduledWorkflows,
    GetWorkflowsRequest
  >(GET_WORKFLOW_DETAILS, {
    variables: {
      request: {
        projectID,
        pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
        },
        sort: sortData,
        filter: {
          workflowName: filters.workflowName,
          clusterName: filters.clusterName,
        },
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  // Apollo mutation to delete the selected schedule
  const [deleteSchedule] = useMutation<DeleteSchedule>(DELETE_WORKFLOW, {
    onCompleted: () => refetch(),
  });

  // State for search and filtering

  const [updateSchedule] = useMutation(UPDATE_SCHEDULE, {
    onCompleted: () => refetch(),
  });

  // Disable and re-enable a schedule
  const handleToggleSchedule = (schedule: ScheduledWorkflow) => {
    const yaml = YAML.parse(schedule.workflowManifest);
    if (yaml.spec.suspend === undefined || yaml.spec.suspend === false) {
      yaml.spec.suspend = true;
    } else {
      yaml.spec.suspend = false;
    }

    const weightData: WeightMap[] = [];

    schedule.weightages.forEach((weightEntry) => {
      weightData.push({
        experimentName: weightEntry.experimentName,
        weightage: weightEntry.weightage,
      });
    });

    updateSchedule({
      variables: {
        ChaosWorkFlowInput: {
          workflowID: schedule.workflowID,
          workflowName: schedule.workflowName,
          workflowDescription: schedule.workflowDescription,
          isCustomWorkflow: schedule.isCustomWorkflow,
          cronSyntax: schedule.cronSyntax,
          workflowManifest: JSON.stringify(yaml, null, 2),
          projectID: schedule.projectID,
          clusterID: schedule.clusterID,
          weightages: weightData,
        },
      },
    });
  };

  // Query to get list of Clusters
  const { data: clusterList } = useQuery<Partial<Clusters>, ClusterRequest>(
    GET_CLUSTER_NAMES,
    {
      variables: {
        projectID,
      },
    }
  );

  const filteredWorkflows = data?.listWorkflows.workflows
    .filter((dataRow) =>
      filters.suspended === 'All'
        ? true
        : filters.suspended === 'true'
        ? YAML.parse(dataRow.workflowManifest).spec.suspend === true
        : filters.suspended === 'false'
        ? YAML.parse(dataRow.workflowManifest).spec.suspend === undefined
        : false
    )
    .filter((dataRow) =>
      filters.workflowType === 'All'
        ? true
        : filters.workflowType === 'workflow'
        ? dataRow.cronSyntax.length === 0 || dataRow.cronSyntax === ''
        : filters.workflowType === 'cronworkflow'
        ? dataRow.cronSyntax.length > 0
        : false
    );

  const deleteRow = (wfid: string) => {
    deleteSchedule({
      variables: {
        projectID: getProjectID(),
        workflowID: wfid,
        workflowRunID: '',
      },
    });
  };
  return (
    <div data-cy="workflowSchedulesTable">
      <section className="Heading section">
        <div className={classes.headerSection}>
          {/* Search Field */}
          <InputBase
            id="input-with-icon-adornment"
            placeholder="Search"
            className={classes.search}
            value={filters.workflowName}
            onChange={(event) =>
              setFilters({
                ...filters,
                workflowName: event.target.value as string,
              })
            }
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />

          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel className={classes.selectText}>
              Schedule Type
            </InputLabel>
            <Select
              value={filters.workflowType}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  workflowType: event.target.value as string,
                })
              }
              label="Schedule Type"
              className={classes.selectText}
            >
              <MenuItem value="All">
                {t('chaosWorkflows.browseSchedules.options.all')}
              </MenuItem>
              <MenuItem value="workflow">
                {t('chaosWorkflows.browseSchedules.options.workflow')}
              </MenuItem>
              <MenuItem value="cronworkflow">
                {t('chaosWorkflows.browseSchedules.options.cronworkflow')}
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel className={classes.selectText}>
              Schedule Status
            </InputLabel>
            <Select
              value={filters.suspended}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  suspended: event.target.value as string,
                })
              }
              label="Schedule Status"
              className={classes.selectText}
            >
              <MenuItem value="All">
                {t('chaosWorkflows.browseSchedules.options.all')}
              </MenuItem>
              <MenuItem value="false">
                {t('chaosWorkflows.browseSchedules.options.enabledOnly')}
              </MenuItem>
              <MenuItem value="true">
                {t('chaosWorkflows.browseSchedules.options.disabledOnly')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Select Cluster */}
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel className={classes.selectText}>Target Agent</InputLabel>
            <Select
              value={filters.clusterName}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  clusterName: event.target.value as string,
                })
              }
              label="Target Cluster"
              className={classes.selectText}
            >
              <MenuItem value="All">All</MenuItem>
              {clusterList?.listClusters?.map((cluster) => (
                <MenuItem key={cluster.clusterName} value={cluster.clusterName}>
                  {cluster.clusterName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </section>
      <Paper className={classes.root}>
        {/* Table Header */}
        <TableContainer
          data-cy="browseScheduleTable"
          className={classes.tableMain}
        >
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                {/* WorkFlow Name */}
                <TableCell className={classes.workflowName}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography style={{ paddingLeft: 30, paddingTop: 12 }}>
                      {t('chaosWorkflows.browseSchedules.name')}
                    </Typography>
                    <div className={classes.sortDiv}>
                      <IconButton
                        aria-label="sort name ascending"
                        size="small"
                        onClick={() =>
                          setSortData({
                            field: 'NAME',
                            descending: false,
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

                {/* Cluster */}
                <TableCell>
                  <Typography className={classes.targetCluster}>
                    {t('chaosWorkflows.browseSchedules.agent')}
                  </Typography>
                </TableCell>

                {/* Last Updated By */}
                <TableCell>
                  <Typography className={classes.lastUpdatedBy}>
                    {t('chaosWorkflows.browseSchedules.lastUpdatedBy')}
                  </Typography>
                </TableCell>

                {/* Show Experiments */}
                <TableCell>
                  <Typography className={classes.showExp}>
                    {t('chaosWorkflows.browseSchedules.experiments')}
                  </Typography>
                </TableCell>

                {/* Show Schedule Details */}
                <TableCell>
                  <Typography className={classes.showExp}>
                    {t('chaosWorkflows.browseSchedules.schedule')}
                  </Typography>
                </TableCell>

                {/* Next Run */}
                <TableCell>
                  <Typography className={classes.showExp}>
                    {t('chaosWorkflows.browseSchedules.nextRun')}
                  </Typography>
                </TableCell>
                {/* List Experiments */}
                <TableCell>
                  <Typography>
                    {t('chaosWorkflows.browseSchedules.wfRuns')}
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Loader />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell data-cy="browseScheduleError" colSpan={8}>
                    <Typography align="center">Unable to fetch data</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredWorkflows && filteredWorkflows.length ? (
                filteredWorkflows.map((data) => (
                  <TableRow
                    data-cy="workflowSchedulesTableRow"
                    key={data.workflowID}
                  >
                    <TableData
                      data={data}
                      deleteRow={deleteRow}
                      setWorkflowName={setWorkflowName}
                      handleToggleSchedule={handleToggleSchedule}
                    />
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell data-cy="browseScheduleNoData" colSpan={8}>
                    <Typography align="center">No records available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Section */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.listWorkflows.totalNoOfWorkflows ?? 0}
          rowsPerPage={paginationData.limit}
          page={paginationData.page}
          onChangePage={(_, page) =>
            setPaginationData({ ...paginationData, page })
          }
          onChangeRowsPerPage={(event) => {
            setPaginationData({
              ...paginationData,
              page: 0,
              limit: parseInt(event.target.value, 10),
            });
          }}
        />
      </Paper>
    </div>
  );
};

export default BrowseSchedule;
