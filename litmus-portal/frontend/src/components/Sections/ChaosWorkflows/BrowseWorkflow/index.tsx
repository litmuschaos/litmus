import React, { useEffect, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import SearchIcon from '@material-ui/icons/Search';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  InputBase,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
} from '@material-ui/core';
import useStyles from './styles';
import { WORKFLOW_DETAILS, WORKFLOW_EVENTS } from '../../../../schemas';
import TableData from './TableData';

const BrowseWorkflow = () => {
  // Apollo query with subscribeToMore
  const { data } = useQuery(WORKFLOW_DETAILS);
  const subsData = useSubscription(WORKFLOW_EVENTS);
  // Default table data
  const [mainData, setMainData] = useState<any>();

  const classes = useStyles();

  const [search, setSearch] = React.useState<string>('');

  const [status, setStatus] = React.useState<string>('');

  const [page, setPage] = React.useState(0);

  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [searchedData, setSearchedData] = React.useState<any>();

  useEffect(() => {
    if (mainData === undefined) return;
    const wfData = JSON.parse(JSON.stringify(mainData));
    let i = 0;
    for (; i < wfData.getWorkFlowRuns.length; i++) {
      if (
        wfData.getWorkFlowRuns[i]['workflow_run_id'] ===
        subsData.data.workflowEventListener['workflow_run_id']
      ) {
        wfData.getWorkFlowRuns[i] = subsData.data.workflowEventListener;
        break;
      }
    }
    if (i === wfData.getWorkFlowRuns.length)
      wfData.getWorkFlowRuns.push(subsData.data.workflowEventListener);
    setSearchedData(wfData);
  }, [subsData.data]);

  useEffect(() => {
    setMainData(data);
    setSearchedData(mainData);
  }, [data, mainData]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    const searchData = mainData.getWorkFlowRuns?.filter(
      (data: { workflow_name: string; execution_data: string }) =>
        data.workflow_name.toLowerCase().includes(event.target.value) &&
        JSON.parse(data.execution_data).phase.includes(status)
    );
    setPage(0);
    setSearchedData({ getWorkFlowRuns: searchData });
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(event.target.value as string);
    const statusData = mainData.getWorkFlowRuns.filter((data: any) =>
      JSON.parse(data.execution_data).phase.includes(
        event.target.value as string
      )
    );
    setSearch('');
    setSearchedData({ getWorkFlowRuns: statusData });
  };

  const [cluster, setCluster] = React.useState<string>('');

  const handleClusterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCluster(event.target.value as string);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const ascWorkflowName = () => {
  //   var data =
  //     mainData &&
  //     mainData.getWorkFlowRuns.slice().sort((a: any, b: any) => {
  //       return a.workflow_name - b.workflow_name;
  //     });
  //   console.log(data);
  // };
  // console.log(mainData);
  const emptyRows =
    rowsPerPage -
    Math.min(
      rowsPerPage,
      mainData && mainData.getWorkFlowRuns.length - page * rowsPerPage
    );
  return (
    <div>
      <section className="Heading section">
        <div className={classes.headerSection}>
          <InputBase
            id="input-with-icon-adornment"
            placeholder="Search"
            className={classes.search}
            value={search}
            onChange={handleSearch}
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
              value={status}
              onChange={handleStatusChange}
              disableUnderline
            >
              <MenuItem value="">
                <Typography className={classes.menuItem}>None</Typography>
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
              value={cluster}
              onChange={handleClusterChange}
              disableUnderline
            >
              <MenuItem value="">
                <Typography className={classes.menuItem}>None</Typography>
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
          <Typography variant="subtitle1" className={classes.headerText}>
            for the period
          </Typography>
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
              {searchedData && searchedData.getWorkFlowRuns.length ? (
                searchedData &&
                searchedData.getWorkFlowRuns
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((data: any) => (
                    <TableRow>
                      <TableData data={data} />
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
          count={searchedData && searchedData.getWorkFlowRuns.length}
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
