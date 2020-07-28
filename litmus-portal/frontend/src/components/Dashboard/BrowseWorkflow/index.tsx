import React from 'react';
import {
  Typography,
  InputAdornment,
  InputBase,
  FormControl,
  InputLabel,
  Select,
  TableHead,
  TableRow,
  TableContainer,
  Table,
  TableCell,
  TableBody,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
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
    'Today'
  ),
  createData(
    'Completed',
    'Basic K8S Conformance',
    'Cluset pre-defined',
    100,
    3,
    '2 days ago'
  ),
  createData('Running', 'Battery Flow', 'Kubernetes Cluster', 0, 5, 'Today'),
  createData(
    'Running',
    'Workflow Underground',
    'Kubernetes Cluster',
    0,
    2,
    'Today'
  ),
  createData(
    'Completed',
    'Workflow Underground',
    'Cluset pre-defined',
    100,
    3,
    'Week Ago'
  ),
];
const BrowseWorkflow = () => {
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
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: '#FFFFFF',
          }}
        >
          <InputBase
            id="input-with-icon-adornment"
            placeholder="Search"
            style={{
              marginRight: 'auto',
              marginLeft: 50,
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
          />
          <FormControl
            style={{
              width: 150,
              marginLeft: 30,
              paddingBottom: 20,
            }}
          >
            <InputLabel htmlFor="workflow-status">Workflow Status</InputLabel>
            <Select
              native
              value={status}
              disableUnderline
              onChange={handleStatusChange}
              inputProps={{
                name: 'Workflow Status',
              }}
            >
              <option aria-label="None" value="" />
              <option value="Running">Running</option>
              <option value="Completed">Completed</option>
            </Select>
          </FormControl>
          <FormControl
            style={{ width: 150, marginLeft: 30, paddingBottom: 20 }}
          >
            <InputLabel htmlFor="target-cluster">Target Cluster</InputLabel>
            <Select
              native
              value={cluster}
              disableUnderline
              onChange={handleClusterChange}
              inputProps={{
                name: 'Target Cluster',
              }}
            >
              <option aria-label="None" value="" />
              <option value="predefined">Cluset Predefined</option>
              <option value="kubernetes">Kubernetes cluster</option>
            </Select>
          </FormControl>
          <Typography
            variant="subtitle1"
            style={{ marginLeft: 30, color: 'rgba(0,0,0,0.4)' }}
          >
            for the period
          </Typography>
          <FormControl
            style={{ width: 150, marginLeft: 30, paddingBottom: 20 }}
          >
            <InputLabel htmlFor="target-cluster">Date</InputLabel>
            <Select
              native
              value={cluster}
              disableUnderline
              onChange={handleClusterChange}
              inputProps={{
                name: 'Target Cluster',
              }}
            >
              <option aria-label="None" value="" />
              <option value="predefined">Cluset Predefined</option>
              <option value="kubernetes">Kubernetes cluster</option>
            </Select>
          </FormControl>
        </div>
      </section>
      <section className="table section">
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Workflow Name</TableCell>
                <TableCell>Target Cluster</TableCell>
                <TableCell>Reliability Details</TableCell>
                <TableCell># of experiments</TableCell>
                <TableCell>Last Run</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((data) => (
                <TableRow>
                  <TableCell>
                    <Typography
                      style={{
                        width: 100,
                        textAlign: 'center',
                        borderRadius: 3,
                        paddingTop: 3,
                        paddingBottom: 3,
                        color:
                          data.status === 'Completed' ? 'green' : '#858CDD',
                        backgroundColor:
                          data.targetCluster === 'Completed'
                            ? 'rgba(16, 155, 103, 0.1)'
                            : 'rgba(133, 140, 221, 0.1)',
                      }}
                    >
                      {data.status}
                    </Typography>
                  </TableCell>
                  <TableCell>{data.workflowName}</TableCell>
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
                    <div style={{ width: 100 }}>
                      <LinearProgressBar value={data.reliability} />
                    </div>
                  </TableCell>
                  <TableCell>{data.steps}</TableCell>
                  <TableCell>{data.lastRun}</TableCell>
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
