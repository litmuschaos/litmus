import { Typography, useTheme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { InputField } from 'litmus-ui';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import useStyles from './styles';

interface TargetApplicationData {
  target: string;
  pod: string;
  appns: string;
  appkind: string;
  applabel: string;
  annotationCheck: boolean;
  jobCleanUpPolicy: string;
}

interface TargetApplicationProp {
  isCustom: boolean | undefined;
  chaosEngine?: any;
  setChaosEngine: React.Dispatch<any>;
}

const TargetApplication: React.FC<TargetApplicationProp> = ({
  isCustom,
  chaosEngine,
  setChaosEngine,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  // ChaosEngine manifest
  const engineManifest = chaosEngine;

  // State variable for editing the ChaosEngine Configuration
  const [targetApp, setTargetApp] = useState<TargetApplicationData>({
    target: 'Namespace 1',
    pod: 'Pod 1',
    appns: engineManifest.spec.appinfo.appns,
    applabel: engineManifest.spec.appinfo.applabel,
    appkind: engineManifest.spec.appinfo.appkind,
    annotationCheck:
      typeof engineManifest.spec.annotationCheck === 'boolean'
        ? engineManifest.spec.annotationCheck
        : engineManifest.spec.annotationCheck === 'true',
    jobCleanUpPolicy: engineManifest.spec.jobCleanUpPolicy,
  });

  // State varibles for the AnnotationCheck toggle button
  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: boolean
  ) => {
    if (newAlignment !== null) {
      setTargetApp({ ...targetApp, annotationCheck: newAlignment });
      engineManifest.spec.annotationCheck = newAlignment.toString();
    }
  };

  // useEffect to update the ChaosEngine with
  // change in the configuration
  useEffect(() => {
    setChaosEngine(engineManifest);
  }, [targetApp]);

  return (
    <div>
      <Typography>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </Typography>
      <br />
      <div className={classes.inputDiv}>
        <InputField
          label="Target Application"
          value={targetApp.target}
          onChange={(event) => {
            setTargetApp({ ...targetApp, target: event.target.value });
          }}
        />
        <br />
        {isCustom && (
          <>
            <InputField
              label="Pod"
              value={targetApp.pod}
              onChange={(event) => {
                setTargetApp({ ...targetApp, pod: event.target.value });
              }}
            />
            <br />
            <InputField
              label="appns"
              value={targetApp.appns}
              onChange={(event) => {
                setTargetApp({ ...targetApp, appns: event.target.value });
                engineManifest.spec.appinfo.appns = event.target.value;
              }}
            />
            <br />
            <InputField
              label="applabel"
              value={targetApp.applabel}
              onChange={(event) => {
                setTargetApp({ ...targetApp, applabel: event.target.value });
                engineManifest.spec.appinfo.applabel = event.target.value;
              }}
            />
            <br />
            <InputField
              label="appkind"
              value={targetApp.appkind}
              onChange={(event) => {
                setTargetApp({ ...targetApp, appkind: event.target.value });
                engineManifest.spec.appinfo.appkind = event.target.value;
              }}
            />
            <br />
            <InputField
              label="jobCleanUpPolicy"
              value={targetApp.jobCleanUpPolicy}
              onChange={(event) => {
                setTargetApp({
                  ...targetApp,
                  jobCleanUpPolicy: event.target.value,
                });
                engineManifest.spec.jobCleanUpPolicy = event.target.value;
              }}
            />
          </>
        )}
      </div>
      <br />
      <div style={{ display: 'flex' }}>
        <Typography className={classes.annotation}>Annotation Check</Typography>
        <ToggleButtonGroup
          value={targetApp.annotationCheck}
          exclusive
          onChange={handleAlignment}
          aria-label="text alignment"
        >
          <ToggleButton
            className={classes.annotationToggleBtn}
            style={{
              backgroundColor: targetApp.annotationCheck
                ? theme.palette.success.main
                : theme.palette.disabledBackground,
            }}
            value
            aria-label="left aligned"
          >
            <Typography
              style={{
                color: targetApp.annotationCheck
                  ? theme.palette.common.white
                  : theme.palette.text.disabled,
              }}
              className={classes.text}
            >
              True
            </Typography>
          </ToggleButton>
          <ToggleButton
            style={{
              backgroundColor: !targetApp.annotationCheck
                ? theme.palette.error.main
                : theme.palette.disabledBackground,
            }}
            className={classes.annotationToggleBtn}
            value={false}
            aria-label="centered"
          >
            <Typography
              style={{
                color: !targetApp.annotationCheck
                  ? theme.palette.common.white
                  : theme.palette.text.disabled,
                textTransform: 'none',
              }}
              className={classes.text}
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

export default TargetApplication;
