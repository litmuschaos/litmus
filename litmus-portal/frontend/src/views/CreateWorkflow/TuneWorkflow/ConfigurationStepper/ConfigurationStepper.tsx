import React, { useState } from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { ButtonOutlined, InputField } from 'litmus-ui';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import YAML from 'yaml';
import AddProbe from '../AddProbe';
import useStyles from './styles';

interface ChaosCRDTable {
  Name: string;
  Namespace: string;
  Application: string;
  Probes: number;
  ChaosEngine: string;
}

interface ConfigurationStepperProps {
  experimentData: ChaosCRDTable | undefined;
  closeStepper: () => void;
}

interface ProbeProps {
  probes: any;
}

function getSteps() {
  return [
    'General',
    'Target Application',
    'Define the steady state for this application',
  ];
}

const General = () => {
  const classes = useStyles();
  return (
    <div>
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Typography>
      <br />
      <div className={classes.generalContainer}>
        <InputField label="Hub" />
        <br />
        <InputField label="Experiment Name" />
      </div>
      <br />
    </div>
  );
};

const TargetApplication = () => {
  const classes = useStyles();
  const [alignment, setAlignment] = React.useState<boolean>(true);
  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: boolean
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };
  return (
    <div>
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Typography>
      <br />
      <div className={classes.inputDiv}>
        <InputField label="Target Application" />
        <br />
        <InputField label="Pod" />
      </div>
      <br />
      <div style={{ display: 'flex' }}>
        <Typography className={classes.annotation}>Annotation Check</Typography>
        <ToggleButtonGroup
          value={alignment}
          exclusive
          onChange={handleAlignment}
          aria-label="text alignment"
        >
          <ToggleButton
            className={classes.annotationToggleBtn}
            style={{
              backgroundColor: alignment ? '#109B67' : '#D9D9D9',
            }}
            value
            aria-label="left aligned"
          >
            <Typography
              style={{
                color: alignment ? '#FFFFFF' : 'rgba(0, 0, 0, 0.38)',
                textTransform: 'none',
              }}
            >
              True
            </Typography>
          </ToggleButton>
          <ToggleButton
            style={{
              backgroundColor: !alignment ? '#CA2C2C' : '#D9D9D9',
            }}
            className={classes.annotationToggleBtn}
            value={false}
            aria-label="centered"
          >
            <Typography
              style={{
                color: !alignment ? '#FFFFFF' : 'rgba(0, 0, 0, 0.38)',
                textTransform: 'none',
              }}
            >
              False
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
        <br />
      </div>
      <br />
      <Typography className={classes.annotationDesc}>
        The target application does not have an annotation “Chaos=true”.
        Ideally, you cannot run this experiment unless the annotation is patched
        to the application. However, this service account has the privileges to
        disable the enforcement of annotation checks. Mark the annotation as
        false to proceed.
      </Typography>
    </div>
  );
};

const SteadyState: React.FC<ProbeProps> = ({ probes }) => {
  const classes = useStyles();
  const [addProbe, setAddProbe] = useState<boolean>(false);
  const handleAddProbe = () => {
    setAddProbe(false);
  };
  const handleClose = () => {
    setAddProbe(false);
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Probe Name</TableCell>
              <TableCell align="left">Type</TableCell>
              <TableCell align="left">Mode</TableCell>
              <TableCell align="left">Properties</TableCell>
              <TableCell align="left">Probe Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {probes.map((probe: any) => (
              <TableRow key={probe.name}>
                <TableCell component="th" scope="row">
                  {probe.name}
                </TableCell>
                <TableCell align="left" style={{ cursor: 'pointer' }}>
                  {probe.type}
                </TableCell>
                <TableCell align="left">{probe.mode}</TableCell>
                <TableCell align="left">Probe Properties</TableCell>
                <TableCell align="left">Probe Details</TableCell>
              </TableRow>
            ))}
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
};

function getStepContent(step: number, probes: any) {
  switch (step) {
    case 0:
      return <General />;
    case 1:
      return <TargetApplication />;
    case 2:
      return <SteadyState probes={probes} />;
    default:
      return <General />;
  }
}

const ConfigurationStepper: React.FC<ConfigurationStepperProps> = ({
  experimentData,
  closeStepper,
}) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const parsedChaosEngine = YAML.parse(experimentData?.ChaosEngine || '');
  const probes = parsedChaosEngine.spec.experiments[0].spec.probe;

  return (
    <div className={classes.root}>
      <div>
        <ButtonOutlined onClick={closeStepper} style={{ float: 'right' }}>
          &#x2715;
        </ButtonOutlined>
      </div>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Typography>{getStepContent(index, probes)}</Typography>
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} className={classes.button}>
            Reset
          </Button>
        </Paper>
      )}
    </div>
  );
};

export default ConfigurationStepper;
