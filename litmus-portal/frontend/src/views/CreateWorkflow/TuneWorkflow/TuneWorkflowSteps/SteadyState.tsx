import {
  Button,
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
  useTheme,
} from '@material-ui/core';
import { ButtonOutlined, Icon } from 'litmus-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import YAML from 'yaml';
import { WorkflowManifest } from '../../../../models/redux/workflow';
import useActions from '../../../../redux/actions';
import * as WorkflowActions from '../../../../redux/actions/workflow';
import { RootState } from '../../../../redux/reducers';
import AddProbe from '../AddProbe';
import useStyles from './styles';

interface SteadyStateProps {
  infra: boolean;
  gotoStep: (page: number) => void;
}

const SteadyState: React.FC<SteadyStateProps> = ({ infra, gotoStep }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const workflow = useActions(WorkflowActions);

  const manifest: WorkflowManifest = useSelector(
    (state: RootState) => state.workflowManifest
  );
  const chaosEngine = YAML.parse(manifest.engineYAML);
  const [probesData, setProbesData] = useState(
    chaosEngine.spec.experiments[0].spec.probe &&
      chaosEngine.spec.experiments[0].spec.probe.length
      ? chaosEngine.spec.experiments[0].spec.probe
      : []
  );

  const [isAddButtonClicked, setIsAddButtonClicked] = useState<boolean>(false);

  // State varible to handle the Probe Modal
  const [addProbe, setAddProbe] = useState<boolean>(false);
  const [selectedProbeIndex, setSelectedProbeIndex] = useState<number>(0);
  const handleClose = () => {
    setIsAddButtonClicked(false);
    setAddProbe(false);
  };

  // handleManiYAMLChange allows to update the changes in individual Chaos Engines
  const handleMainYAMLChange = () => {
    workflow.setWorkflowManifest({
      engineYAML: YAML.stringify(chaosEngine),
    });
  };

  // State variable to store Probe Data
  const [probeDetails, setProbeDetails] = useState<object>();
  const [probeProperties, setProbeProperties] = useState({});
  const [edit, setEdit] = useState<boolean>(false);

  // State variable to handle the Probe Details Popover
  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [propertyAnchorEl, setPropertyPopAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const isOpen = Boolean(popAnchorEl);
  const isPropertyOpen = Boolean(propertyAnchorEl);
  const id = isOpen ? 'simple-popover' : undefined;
  const propertyid = isPropertyOpen ? 'simple-popover' : undefined;

  // Event handler for Details and Properties PopOvers
  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
  };
  const handlePropertyPopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPropertyPopAnchorEl(event.currentTarget);
  };

  // Funtion to handle delete probe operation
  const deleteProbe = (index: number) => {
    probesData.splice(index, 1);
    chaosEngine.spec.experiments[0].spec.probe = probesData;
    setProbesData(probesData);
    handleMainYAMLChange();
  };
  // Function to handle add probes operation
  const handleAddProbe = (probes: any) => {
    setProbesData(probes);
    setIsAddButtonClicked(false);
    setAddProbe(false);
  };

  const handleNext = () => {
    chaosEngine.spec.experiments[0].spec.probe = probesData;
    handleMainYAMLChange();
    gotoStep(infra ? 1 : 2);
  };

  return (
    <div data-cy="SteadyState">
      <TableContainer className={classes.table} component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                {t('createWorkflow.tuneWorkflow.steadyState.name')}
              </TableCell>
              <TableCell align="left">
                {t('createWorkflow.tuneWorkflow.steadyState.type')}
              </TableCell>
              <TableCell align="left">
                {t('createWorkflow.tuneWorkflow.steadyState.mode')}
              </TableCell>
              <TableCell align="left">
                {t('createWorkflow.tuneWorkflow.steadyState.details')}
              </TableCell>
              <TableCell align="left">
                {t('createWorkflow.tuneWorkflow.steadyState.properties')}
              </TableCell>
              <TableCell align="left" />
              <TableCell align="left" />
            </TableRow>
          </TableHead>
          <TableBody>
            {probesData && probesData.length ? (
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
                      <Typography>
                        {t(
                          'createWorkflow.tuneWorkflow.steadyState.showDetails'
                        )}
                      </Typography>
                    </ButtonOutlined>
                  </TableCell>

                  {/* Probe Details PopOver */}
                  <Popover
                    id={id}
                    open={isOpen}
                    anchorEl={popAnchorEl}
                    onClose={() => setPopAnchorEl(null)}
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
                  <TableCell align="left">
                    <ButtonOutlined
                      onClick={(event) => {
                        setProbeProperties(probe.runProperties);
                        handlePropertyPopOverClick(event);
                      }}
                      className={classes.btn1}
                    >
                      <Typography>
                        {t('createWorkflow.tuneWorkflow.steadyState.showProp')}
                      </Typography>
                    </ButtonOutlined>
                  </TableCell>

                  {/* Probe Properties PopOver */}
                  <Popover
                    id={propertyid}
                    open={isPropertyOpen}
                    anchorEl={propertyAnchorEl}
                    onClose={() => setPropertyPopAnchorEl(null)}
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
                        <pre>{YAML.stringify(probeProperties)}</pre>
                      </Typography>
                    </div>
                  </Popover>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setEdit(true);
                        setSelectedProbeIndex(index);
                        setAddProbe(true);
                      }}
                    >
                      <Icon
                        name="pencil"
                        size="lg"
                        color={theme.palette.text.hint}
                      />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        deleteProbe(index);
                      }}
                    >
                      <Icon
                        name="trash"
                        size="lg"
                        color={theme.palette.error.main}
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography align="center">
                    {t('createWorkflow.tuneWorkflow.steadyState.addProbe')}
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
          setEdit(false);
          setAddProbe(true);
          setIsAddButtonClicked(true);
        }}
        className={classes.btn1}
      >
        <Typography>
          {t('createWorkflow.tuneWorkflow.steadyState.addNewProbe')}
        </Typography>
      </ButtonOutlined>
      <AddProbe
        isEdit={edit}
        addButtonState={isAddButtonClicked}
        editIndex={selectedProbeIndex}
        allProbesData={probesData}
        probesValue={
          probesData && probesData.length
            ? probesData[selectedProbeIndex]
            : probesData
        }
        addProbe={(probes: any) => handleAddProbe(probes)}
        handleClose={handleClose}
        open={addProbe}
      />
      <div data-cy="SteadyStateControlButtons">
        {!infra && (
          <Button onClick={() => gotoStep(0)} className={classes.button}>
            {t('createWorkflow.tuneWorkflow.steadyState.back')}
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleNext()}
          className={classes.button}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default SteadyState;
