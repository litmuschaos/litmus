import { useQuery } from '@apollo/client';
import {
  FormControl,
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
import SearchIcon from '@material-ui/icons/Search';
import React, { useEffect, useState } from 'react';
import { WORKFLOW_DETAILS, WORKFLOW_EVENTS } from '../../../../graphql';
import useStyles from './styles';
import TableData from './TableData';

const ScheduleWorkflow = () => {
  // Apollo query with subscribeToMore
  const { subscribeToMore, ...result } = useQuery(WORKFLOW_DETAILS);

  // Default table data
  const [mainData, setMainData] = useState<any>();

  useEffect(() => {
    // Get the inital table data
    setMainData(result.data);
    // Once Subscription is made, this is called
    subscribeToMore({
      document: WORKFLOW_EVENTS,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return setMainData(prev);
        const newData = subscriptionData.data.workflowEventListener;
        return setMainData({
          ...prev,
          getWorkFlowRuns: [...prev.getWorkFlowRuns, newData],
        });
      },
    });
  }, [result.data]);
  const classes = useStyles();

  const [page, setPage] = React.useState(0);

  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [search, setSearch] = React.useState<String>('');

  // const [status, setStatus] = React.useState<String>('');

  // const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   setStatus(event.target.value as String);
  // };

  const [cluster, setCluster] = React.useState<String>('');

  const handleClusterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCluster(event.target.value as String);
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
            onChange={(e) => setSearch(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />
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
        </div>
      </section>
      <section className="table section">
        <TableContainer className={classes.tableMain}>
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell className={classes.workflowName}>
                  Workflow Name
                </TableCell>
                <TableCell className={classes.headerStatus}>
                  Starting Date
                </TableCell>
                <TableCell>
                  <Typography className={classes.targetCluster}>
                    Regularity
                  </Typography>
                </TableCell>
                <TableCell>Cluster</TableCell>
                <TableCell>Show Experiments</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {mainData &&
                mainData.getWorkFlowRuns
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .reverse()
                  .map((data: any) => (
                    <TableRow>
                      <TableData data={data} />
                    </TableRow>
                  ))}
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
          count={mainData && mainData.getWorkFlowRuns.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </section>
    </div>
  );
};

export default ScheduleWorkflow;
