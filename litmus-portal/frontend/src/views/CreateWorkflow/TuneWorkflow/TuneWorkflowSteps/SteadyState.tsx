import {
  IconButton,
  Paper,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { ButtonOutlined } from 'litmus-ui';
import React, { useImperativeHandle, useState } from 'react';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import AddProbe from '../AddProbe';
import useStyles from './styles';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import { WorkflowManifest } from '../../../../models/redux/workflow';
import { RootState } from '../../../../redux/reducers';
import useActions from '../../../../redux/actions';

interface SteadyStateProps {
  engineIndex: number;
}

const SteadyState = React.forwardRef<unknown, SteadyStateProps>(
  ({ engineIndex }, ref) => {
    const classes = useStyles();
    const workflow = useActions(WorkflowActions);

    const manifest: WorkflowManifest = useSelector(
      (state: RootState) => state.workflowManifest
    );
    const chaosEngine = YAML.parse(manifest.engineYAML);
    const [probesData, setProbesData] = useState(
      chaosEngine.spec.experiments[0].spec.probe
    );

    // State varible to handle the Probe Modal
    const [addProbe, setAddProbe] = useState<boolean>(false);
    const handleClose = () => {
      setAddProbe(false);
    };
    const handleAddProbe = () => {
      setAddProbe(false);
    };

    // State variable to store Probe Data
    const [probeDetails, setProbeDetails] = useState<object>();

    // State variable to handle the Probe Details Popover
    const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
      null
    );
    const isOpen = Boolean(popAnchorEl);
    const id = isOpen ? 'simple-popover' : undefined;
    const handlePopOverClose = () => {
      setPopAnchorEl(null);
    };
    const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
      setPopAnchorEl(event.currentTarget);
    };

    const handleMainYAMLChange = () => {
      const mainManifest = YAML.parse(manifest.manifest);
      mainManifest.spec.templates[
        engineIndex
      ].inputs.artifacts[0].raw.data = YAML.stringify(chaosEngine);
      workflow.setWorkflowManifest({
        manifest: YAML.stringify(mainManifest),
        engineYAML: YAML.stringify(chaosEngine),
      });
    };

    const deleteProbe = (index: number) => {
      probesData.splice(index, 1);
      chaosEngine.spec.experiments[0].spec.probe = probesData;
      setProbesData(probesData);
      handleMainYAMLChange();
    };

    function onNext() {
      return true;
    }

    useImperativeHandle(ref, () => ({
      onNext,
    }));

    return (
      <div>
        <TableContainer className={classes.table} component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Probe Name</TableCell>
                <TableCell align="left">Type</TableCell>
                <TableCell align="left">Mode</TableCell>
                <TableCell align="left">Properties</TableCell>
                <TableCell align="left">Probe Details</TableCell>
                <TableCell align="left" />
              </TableRow>
            </TableHead>
            <TableBody>
              {probesData?.length ? (
                probesData.map((probe: any, index: number) => (
                  <TableRow key={probe.name}>
                    <TableCell component="th" scope="row">
                      {probe.name}
                    </TableCell>
                    <TableCell align="left" style={{ cursor: 'pointer' }}>
                      {probe.type}
                    </TableCell>
                    <TableCell align="left">{probe.mode}</TableCell>
                    <TableCell align="left">
                      <ButtonOutlined
                        onClick={(event) => {
                          setProbeDetails(probe[`${probe.type}/inputs`]);
                          handlePopOverClick(event);
                        }}
                        className={classes.btn1}
                      >
                        <Typography> Show Properties </Typography>
                      </ButtonOutlined>
                    </TableCell>
                    <Popover
                      id={id}
                      open={isOpen}
                      anchorEl={popAnchorEl}
                      onClose={handlePopOverClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                      className={classes.probePopOver}
                    >
                      <div className={classes.popOverDiv}>
                        <Typography className={classes.probeText}>
                          <pre>{YAML.stringify(probeDetails)}</pre>
                        </Typography>
                      </div>
                    </Popover>
                    <TableCell align="left">Probe Details</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          deleteProbe(index);
                        }}
                      >
                        <img
                          src="/icons/bin-red-delete.svg"
                          alt="delete"
                          style={{ width: 20, height: 20 }}
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography align="center">
                      Please add probes to see the data
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <br />
        <ButtonOutlined
          onClick={() => {
            setAddProbe(true);
          }}
          className={classes.btn1}
        >
          <Typography> + Add a new Probe </Typography>
        </ButtonOutlined>
        <AddProbe
          addProbe={handleAddProbe}
          handleClose={handleClose}
          open={addProbe}
        />
      </div>
    );
  }
);

export default SteadyState;
