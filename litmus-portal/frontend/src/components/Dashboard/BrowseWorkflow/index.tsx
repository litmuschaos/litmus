import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import SearchIcon from '@material-ui/icons/Search';
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
} from '@material-ui/core';
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

  const [search, setSearch] = React.useState<String>('');

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            />
          </FormControl>
        </div>
      </section>
      <section className="table section">
        <TableContainer className={classes.tableMain}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell className={classes.headerStatus}>Status</TableCell>
                <TableCell className={classes.workflowName}>
                  Workflow Name
                </TableCell>
                <TableCell>
                  <Typography className={classes.targetCluster}>
                    Target Cluster
                  </Typography>
                </TableCell>
                <TableCell>Reliability Details</TableCell>
                <TableCell># of experiments</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {mainData &&
                mainData.getWorkFlowRuns
                  .slice(0)
                  .reverse()
                  .map((data: any) => (
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
