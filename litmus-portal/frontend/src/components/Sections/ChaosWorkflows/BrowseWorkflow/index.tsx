import { useQuery } from '@apollo/client';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
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
import React, { useEffect, useState } from 'react';
import { WORKFLOW_DETAILS, WORKFLOW_EVENTS } from '../../../../graphql';
import {
  ExecutionData,
  Workflow,
  WorkflowDataVars,
  WorkflowSubscription,
} from '../../../../models/workflowData';
import Loader from '../../../Loader';
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

const BrowseWorkflow = () => {
  const classes = useStyles();

  // Query to get workflows
  const { subscribeToMore, data, loading, error } = useQuery<
    Workflow,
    WorkflowDataVars
  >(WORKFLOW_DETAILS, { variables: { projectID: '00000' } });

  // Using subscription to get realtime data
  useEffect(() => {
    subscribeToMore<WorkflowSubscription>({
      document: WORKFLOW_EVENTS,
      variables: { projectID: '00000' },
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

  // State for pagination
  const [paginationData, setPaginationData] = useState<PaginationData>({
    pageNo: 0,
    rowsPerPage: 5,
  });

  const filteredData = data?.getWorkFlowRuns
    .filter((dataRow) =>
      dataRow.workflow_name.toLowerCase().includes(filters.search)
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
        : dataRow.cluster_name.toLowerCase().includes(filters.cluster)
    );

  return (
    <div>
      <section className="Heading section">
        <div className={classes.headerSection}>
          <InputBase
            id="input-with-icon-adornment"
            placeholder="Search"
            className={classes.search}
            value={filters.search}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value as string });
              setPaginationData({ ...paginationData, pageNo: 0 });
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />
          <FormControl className={classes.select}>
            <InputLabel id="demo-simple-select-outlined-label">
              Workflow Status
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value as string });
                setPaginationData({ ...paginationData, pageNo: 0 });
              }}
              disableUnderline
            >
              <MenuItem value="All">
                <Typography className={classes.menuItem}>All</Typography>
              </MenuItem>
              <MenuItem value="Failed">
                <Typography className={classes.menuItem}>Failed</Typography>
              </MenuItem>
              <MenuItem value="Running">
                <Typography className={classes.menuItem}>Running</Typography>
              </MenuItem>
              <MenuItem value="Succeeded">
                <Typography className={classes.menuItem}>Succeeded</Typography>
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl className={classes.select1}>
            <InputLabel id="demo-simple-select-outlined-label">
              Target Cluster
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={filters.cluster}
              onChange={(e) => {
                setFilters({ ...filters, cluster: e.target.value as string });
                setPaginationData({ ...paginationData, pageNo: 0 });
              }}
              disableUnderline
            >
              <MenuItem value="All">
                <Typography className={classes.menuItem}>All</Typography>
              </MenuItem>
              <MenuItem value="Predefined">
                <Typography className={classes.menuItem}>
                  Cluset pre-defined
                </Typography>
              </MenuItem>
              <MenuItem value="Kubernetes">
                <Typography className={classes.menuItem}>
                  Kubernetes Cluster
                </Typography>
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.select}>
            <InputLabel id="demo-simple-select-outlined-label">Date</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value=""
              disableUnderline
              onChange={() => {}}
            />
          </FormControl>
        </div>
      </section>
      <section className="table section">
        <TableContainer className={classes.tableMain}>
          <Table stickyHeader aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell className={classes.headerStatus}>Status</TableCell>
                <TableCell className={classes.workflowName}>
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography style={{ paddingTop: 10 }}>
                      Workflow Name
                    </Typography>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        paddingLeft: 10,
                      }}
                    >
                      <IconButton
                        aria-label="sort name"
                        size="small"
                        // onClick={ascWorkflowName}
                      >
                        <ExpandLessIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton aria-label="sort name" size="small">
                        <ExpandMoreIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Typography className={classes.targetCluster}>
                    Target Cluster
                  </Typography>
                </TableCell>
                <TableCell className={classes.headData}>
                  Reliability Details
                </TableCell>
                <TableCell className={classes.headData}>
                  # of experiments
                </TableCell>
                <TableCell className={classes.headData}>Last Run</TableCell>
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
                  <TableCell colSpan={7}>
                    <Typography align="center">Unable to fetch data</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData && filteredData.length ? (
                filteredData
                  .slice(
                    paginationData.pageNo * paginationData.rowsPerPage,
                    paginationData.pageNo * paginationData.rowsPerPage +
                      paginationData.rowsPerPage
                  )
                  .map((dataRow) => (
                    <TableRow>
                      <TableData data={dataRow} />
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography align="center">No records available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
      </section>
    </div>
  );
};

export default BrowseWorkflow;
