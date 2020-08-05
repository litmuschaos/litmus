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
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import { useSubscription } from '@apollo/client';
import useStyles from './styles';
import CustomStatus from '../CustomStatus/Status';
import timeDifferenceForDate from '../../../utils/datesModifier';
import LinearProgressBar from '../../ProgressBar/LinearProgressBar';
import { WORKFLOW_DETAILS } from '../../../schemas';

const BrowseWorkflow = () => {
  const { data } = useSubscription(WORKFLOW_DETAILS);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMenu = () => {};
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
              {data &&
                data.getWorkFlowRuns.map((data: any) => (
                  <TableRow key={data.workflow_run_id}>
                    <TableCell className={classes.headerStatus1}>
                      <CustomStatus
                        status={JSON.parse(data.execution_data).phase}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography>
                        <strong>{data.workflow_name}</strong>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{data.cluster_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <div style={{ width: 130 }}>
                        {JSON.parse(data.execution_data).phase === 'Failed' ? (
                          <>
                            <Typography>Overall RR: 0</Typography>
                            <div className={classes.progressBar}>
                              <LinearProgressBar value={0} />
                            </div>
                          </>
                        ) : (
                          <>
                            <Typography>Overall RR: 100</Typography>
                            <div className={classes.progressBar}>
                              <LinearProgressBar value={100} />
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {
                          Object.keys(JSON.parse(data.execution_data).nodes)
                            .length
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Typography style={{ paddingTop: 10 }}>
                          {timeDifferenceForDate(data.last_updated)}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="more"
                        aria-controls="long-menu"
                        aria-haspopup="true"
                        onClick={handleClick}
                        style={{ marginLeft: 'auto' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        id="long-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={open}
                        onClose={handleClose}
                      >
                        <MenuItem value="Workflow" onClick={handleMenu}>
                          Show the workflow
                        </MenuItem>
                        <MenuItem value="Analysis" onClick={handleMenu}>
                          Show the analysis
                        </MenuItem>
                        <MenuItem value="Scheduler" onClick={handleMenu}>
                          Show the scheduler
                        </MenuItem>
                      </Menu>
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
