import SearchIcon from '@material-ui/icons/Search';
import React, { useEffect, useState } from 'react';
import InputBase from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import { useQuery } from '@apollo/client';
import useStyles from './styles';
import { WORKFLOW_DETAILS, WORKFLOW_EVENTS } from '../../../schemas';
import TableData from './TableData';

const BrowseWorkflow = () => {
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
        if (!subscriptionData.data) return prev;
        const newData = subscriptionData.data.workflowEventListener;
        return setMainData({
          ...prev,
          getWorkFlowRuns: [...prev.getWorkFlowRuns, newData],
        });
      },
    });
  }, [result.data, subscribeToMore]);
  const classes = useStyles();
  const [status, setStatus] = React.useState<String>('');
  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(event.target.value as String);
  };
  const [cluster, setCluster] = React.useState<String>('');
  const handleClusterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCluster(event.target.value as String);
  };
  return (
    <div>
      <section className="Heading section">
        <div className={classes.headerSection}>
          <InputBase
            id="input-with-icon-adornment"
            placeholder="Search"
            className={classes.search}
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
              <MenuItem value="Running">
                <Typography className={classes.menuItem}>Running</Typography>
              </MenuItem>
              <MenuItem value="Completed">
                <Typography className={classes.menuItem}>Completed</Typography>
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
            >
              {/* <option aria-label="None" value="" />
              <option value="predefined">Cluset Predefined</option>
              <option value="kubernetes">Kubernetes cluster</option> */}
            </Select>
          </FormControl>
        </div>
      </section>
      <section className="table section">
        <TableContainer className={classes.tableMain}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell className={classes.headerStatus}>Status</TableCell>
                <TableCell>Workflow Name</TableCell>
                <TableCell>Target Cluster</TableCell>
                <TableCell>Reliability Details</TableCell>
                <TableCell># of experiments</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {mainData &&
                mainData.getWorkFlowRuns.map((data: any) => (
                  <TableRow>
                    <TableData data={data} />
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </div>
  );
};

export default BrowseWorkflow;
