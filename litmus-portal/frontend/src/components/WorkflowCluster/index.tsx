/* eslint-disable max-len */
import {
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import * as React from 'react';
import useStyles from './styles';

/* Check is image which is used as a sign on cluster page */
function Check() {
  const classes = useStyles();

  return <img src="icons/check.png" className={classes.check} alt="Check" />;
}

/* This screen is starting page of workflow */
const WorkflowCluster = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState('female');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <div className={classes.rootcontainer}>
      {/* Arrow mark */}
      <div>
        <Check />
      </div>
      <div>
        <Typography className={classes.heading}>
          <strong> Choose the target Kubernetes cluster</strong>
        </Typography>
        <Typography className={classes.headchaos}>
          You are creating a <strong> new chaos workflow.</strong>
        </Typography>
        <Typography className={classes.headcluster}>
          Select a target Kubernetes cluster to run this workflow.
        </Typography>

        <div className={classes.radiobutton}>
          <FormControl component="fieldset">
            <RadioGroup
              data-cy="selectRadio"
              aria-label="D"
              name="radio-button-demo"
              value={value}
              onChange={handleChange}
            >
              <FormControlLabel
                value="d"
                control={<Radio />}
                label={
                  <Typography>
                    Ignite-cluster(where this Litmus portal is install and
                    running)
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>
        </div>
      </div>

      {/* Division is used for Ignite-cluster(where this Litmus portal is install and running)
      or alternative Install Litmus Agent to other Kubernetes cluster */}
      <div>
        <div
          style={{
            marginLeft: 167,
            textAlign: 'left',
            marginTop: 67,
          }}
        >
          <Button variant="contained" color="secondary" data-cy="selectButton">
            Select and continue
          </Button>
        </div>
        <div className={classes.or}>or</div>
        <div
          style={{
            marginLeft: 372,
            marginTop: -25,
            textAlign: 'left',
          }}
        >
          <Button
            variant="contained"
            color="inherit"
            data-cy="selectLitmusKubernetes"
          >
            Install Litmus agents to other Kubernetes cluster
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCluster;
