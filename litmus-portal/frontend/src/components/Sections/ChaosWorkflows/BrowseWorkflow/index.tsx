/* eslint-disable */
// TODO: Remove the above line...only for debugging temporary fix
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
import {
  Workflow,
  WorkflowSubscription,
} from '../../../../models/workflowData';
import { WORKFLOW_DETAILS, WORKFLOW_EVENTS } from '../../../../schemas';
import Loader from '../../../Loader';
import useStyles from './styles';
import TableData from './TableData';

interface FilterOptions {
  search: string;
  status: string;
  cluster: string;
}

const BrowseWorkflow = () => {
  const classes = useStyles();

  // Query to get workflows
  const { subscribeToMore, data, loading, error } = useQuery<Workflow>(
    WORKFLOW_DETAILS
  );

  // Using subscription to get realtime data
  useEffect(() => {
    subscribeToMore<WorkflowSubscription>({
      document: WORKFLOW_EVENTS,
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

  // const [searchedData, setSearchedData] = React.useState<any>();
  // const [search, setSearch] = React.useState<string>('');
  // const [status, setStatus] = React.useState<string>('');

  // State for pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const applySearch = (data: any) => {
    console.log(data);

    // return data.filter(
    //   (dataRow) => dataRow.workflow_name.toLowerCase().includes(filters.search)
    //   // JSON.parse(data.execution_data).phase.includes(status)
    // );
    return data;
  };

  // const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   setStatus(event.target.value as string);
  //   const statusData = data.getWorkFlowRuns.filter((data: any) =>
  //     JSON.parse(data.execution_data).phase.includes(
  //       event.target.value as string
  //     )
  //   );
  //   setSearch('');
  //   setSearchedData({ getWorkFlowRuns: statusData });
  // };

  // const [cluster, setCluster] = React.useState<string>('');

  // const handleClusterChange = (
  //   event: React.ChangeEvent<{ value: unknown }>
  // ) => {
  //   setCluster(event.target.value as string);
  // };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const emptyRows =
    rowsPerPage -
    Math.min(
      rowsPerPage,
      (data?.getWorkFlowRuns?.length ?? 0) - page * rowsPerPage
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
              setPage(0);
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
                setPage(0);
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
                setPage(0);
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
                <Loader />
              ) : error ? (
                <Typography style={{ padding: 20 }}>
                  Unable to fetch data
                </Typography>
              ) : data && data.getWorkFlowRuns.length ? (
                data.getWorkFlowRuns
                  // .filter(applySearch(data))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((dataRow: any) => (
                    <TableRow>
                      <TableData data={dataRow} />
                    </TableRow>
                  ))
              ) : (
                <Typography style={{ padding: 20 }}>
                  No records available
                </Typography>
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.getWorkFlowRuns.length ?? 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </section>
    </div>
  );
};

export default BrowseWorkflow;
