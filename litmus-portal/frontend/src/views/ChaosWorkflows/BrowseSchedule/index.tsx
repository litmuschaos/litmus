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
  UPDATE_SCHEDULE,
  WORKFLOW_LIST_DETAILS,
} from '../../../graphql';
import { Clusters, ClusterVars } from '../../../models/graphql/clusterData';
import { WeightMap } from '../../../models/graphql/createWorkflowData';
import { DeleteSchedule } from '../../../models/graphql/scheduleData';
import {
  ListWorkflowsInput,
  Pagination,
  ScheduledWorkflow,
  ScheduledWorkflows,
  SortInput,
  WorkflowFilterInput,
} from '../../../models/graphql/workflowListData';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles from './styles';
import TableData from './TableData';

interface FilterOption extends WorkflowFilterInput {
  suspended?: string;
}

const BrowseSchedule: React.FC = () => {
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
    workflow_name: '',
    cluster_name: 'All',
    suspended: 'All',
  });

  // State for sorting
  const [sortData, setSortData] = useState<SortInput>({
    field: 'Time',
    descending: true,
  });

  // Apollo query to get the scheduled data
  const { data, refetch, loading, error } = useQuery<
    ScheduledWorkflows,
    ListWorkflowsInput
  >(WORKFLOW_LIST_DETAILS, {
    variables: {
      workflowInput: {
        project_id: projectID,
        pagination: {
          page: paginationData.page,
          limit: paginationData.limit,
        },
        sort: sortData,
        filter: {
          workflow_name: filters.workflow_name,
          cluster_name: filters.cluster_name,
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
    const yaml = YAML.parse(schedule.workflow_manifest);
    if (yaml.spec.suspend === undefined || yaml.spec.suspend === false) {
      yaml.spec.suspend = true;
    } else {
      yaml.spec.suspend = false;
    }

    const weightData: WeightMap[] = [];

    schedule.weightages.forEach((weightEntry) => {
      weightData.push({
        experiment_name: weightEntry.experiment_name,
        weightage: weightEntry.weightage,
      });
    });

    updateSchedule({
      variables: {
        ChaosWorkFlowInput: {
          workflow_id: schedule.workflow_id,
          workflow_name: schedule.workflow_name,
          workflow_description: schedule.workflow_description,
          isCustomWorkflow: schedule.isCustomWorkflow,
          cronSyntax: schedule.cronSyntax,
          workflow_manifest: JSON.stringify(yaml, null, 2),
          project_id: schedule.project_id,
          cluster_id: schedule.cluster_id,
          weightages: weightData,
        },
      },
    });
  };

  // Query to get list of Clusters
  const { data: clusterList } = useQuery<Partial<Clusters>, ClusterVars>(
    GET_CLUSTER_NAMES,
    {
      variables: {
        project_id: projectID,
      },
    }
  );

  const filteredWorkflows = data?.ListWorkflow.workflows.filter((dataRow) =>
    filters.suspended === 'All'
      ? true
      : filters.suspended === 'true'
      ? YAML.parse(dataRow.workflow_manifest).spec.suspend === true
      : filters.suspended === 'false'
      ? YAML.parse(dataRow.workflow_manifest).spec.suspend === undefined
      : false
  );

  const deleteRow = (wfid: string) => {
    deleteSchedule({
      variables: { workflowid: wfid, workflow_run_id: '' },
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
            value={filters.workflow_name}
            onChange={(event) =>
              setFilters({
                ...filters,
                workflow_name: event.target.value as string,
              })
            }
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />

          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel className={classes.selectText}>Name</InputLabel>
            <Select
              value={filters.suspended}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  suspended: event.target.value as string,
                })
              }
              label="Name"
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
              value={filters.cluster_name}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  cluster_name: event.target.value as string,
                })
              }
              label="Target Cluster"
              className={classes.selectText}
            >
              <MenuItem value="All">All</MenuItem>
              {clusterList?.getCluster?.map((cluster) => (
                <MenuItem
                  key={cluster.cluster_name}
                  value={cluster.cluster_name}
                >
                  {cluster.cluster_name}
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
                            field: 'Name',
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

                {/* Cluster */}
                <TableCell>
                  <Typography className={classes.targetCluster}>
                    {t('chaosWorkflows.browseSchedules.agent')}
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

                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Loader />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell data-cy="browseScheduleError" colSpan={7}>
                    <Typography align="center">Unable to fetch data</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredWorkflows && filteredWorkflows.length ? (
                filteredWorkflows.map((data) => (
                  <TableRow
                    data-cy="workflowSchedulesTableRow"
                    key={data.workflow_id}
                  >
                    <TableData
                      data={data}
                      deleteRow={deleteRow}
                      handleToggleSchedule={handleToggleSchedule}
                    />
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell data-cy="browseScheduleNoData" colSpan={7}>
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
          count={data?.ListWorkflow.total_no_of_workflows ?? 0}
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
