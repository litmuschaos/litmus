import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
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
import useStyles from './styles';
import CustomStatus from '../CustomStatus/Status';
import timeDifferenceForDate from '../../../utils/datesModifier';
import LinearProgressBar from '../../ProgressBar/LinearProgressBar';

interface Data {
  status: string;
  workflowName: string;
  targetCluster: string;
  reliability: number;
  steps: number;
  lastRun: string;
}
function createData(
  status: string,
  workflowName: string,
  targetCluster: string,
  reliability: number,
  steps: number,
  lastRun: string
): Data {
  return { status, workflowName, targetCluster, reliability, steps, lastRun };
}

const rows = [
  createData(
    'Running',
    'Workflow Underground',
    'Kubernetes Cluster',
    0,
    5,
    '2020-07-30T09:01:58.306Z'
  ),
  createData(
    'Completed',
    'Basic K8S Conformance',
    'Cluset pre-defined',
    100,
    3,
    '2020-07-28T12:36:21Z'
  ),
  createData(
    'Running',
    'Battery Flow',
    'Kubernetes Cluster',
    0,
    5,
    '2019-07-23T20:04:12.479Z'
  ),
  createData(
    'Running',
    'Workflow Underground',
    'Kubernetes Cluster',
    0,
    2,
    '2020-06-21T20:04:12.479Z'
  ),
  createData(
    'Failed',
    'Workflow Underground',
    'Cluset pre-defined',
    100,
    3,
    '2020-07-10T20:04:12.479Z'
  ),
];
const BrowseWorkflow = () => {
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
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((data) => (
                <TableRow key={data.workflowName}>
                  <TableCell>
                    <CustomStatus status={data.status} />
                  </TableCell>
                  <TableCell>
                    <Typography>
                      <strong>{data.workflowName}</strong>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      style={{
                        color:
                          data.targetCluster === 'Cluset pre-defined'
                            ? 'green'
                            : 'red',
                      }}
                    >
                      {data.targetCluster}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {data.reliability}
                    <div className={classes.progressBar}>
                      <LinearProgressBar value={data.reliability} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography className={classes.steps}>
                      {data.steps}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {timeDifferenceForDate(data.lastRun)}
                    </Typography>
                  </TableCell>
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
