import {
  FormControl,
  FormControlLabel,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import Radio from '@material-ui/core/Radio';
import * as React from 'react';
import ButtonFilled from '../Button/ButtonFilled';
import ButtonOutLine from '../Button/ButtonOutline';
import useStyles from './styles';
/*
  Check is image which is used as
  a sign on cluster page
*/
function Check() {
  const classes = useStyles();

  return <img src="icons/check.png" className={classes.check} alt="Check" />;
}

/*
  This screen is starting page of workflow
*/
const WorkflowCluster = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState('Experiment');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };
  const handleClick = () => {};
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

      {/* 
        Division is used for Ignite-cluster(where this Litmus portal
        is install and running) or alternative Install Litmus Agent to 
        other Kubernetes cluster 
      */}
      <div className={classes.buttonDiv}>
        <div className={classes.button}>
          <ButtonFilled data-cy="gotItButton" isPrimary>
            <div>Select and Continue</div>
          </ButtonFilled>
        </div>

        <div className={classes.or}>or</div>
        <div>
          <ButtonOutLine
            isDisabled={false}
            data-cy="selectLitmusKubernetes"
            handleClick={handleClick}
          >
            <Typography>
              Install Litmus agents to other Kubernetes cluster
            </Typography>
          </ButtonOutLine>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCluster;
