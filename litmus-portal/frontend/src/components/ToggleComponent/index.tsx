import React from 'react';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import useStyles from './styles';

const ToggleComponent = () => {
  const classes = useStyles();

  // Default Props are false
  const [currentPassState, setCurrentPassState] = React.useState<
    boolean | undefined
  >(true);
  const [currentFailState, setCurrentFailState] = React.useState<
    boolean | undefined
  >(false);

  // Toggle Handlers
  const passToggler = () => {
    if (currentFailState) {
      setCurrentPassState(true);
      setCurrentFailState(false);
    } else {
      setCurrentPassState(true);
    }
  };

  const failToggler = () => {
    if (currentPassState) {
      setCurrentFailState(true);
      setCurrentPassState(false);
    } else {
      setCurrentFailState(true);
    }
  };

  return (
    <div>
      {/* Pass Button */}
      <Button
        onClick={passToggler}
        aria-label="left aligned"
        className={classes.passBtn}
        style={{
          backgroundColor: currentPassState ? '#109B67' : 'rgba(0, 0, 0, 0.1)',
          color: currentPassState ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)',
        }}
      >
        {currentPassState ? (
          <img src="icons/Pass.png" alt="Pass" />
        ) : (
          <img src="icons/NotPass.png" alt="Not Pass" />
        )}
        <Typography style={{ paddingLeft: 10, fontFamily: 'Ubuntu' }}>
          Pass
        </Typography>
      </Button>

      {/* Failed Button */}
      <Button
        onClick={failToggler}
        aria-label="left aligned"
        className={classes.failBtn}
        style={{
          backgroundColor: currentFailState ? '#CA2C2C' : 'rgba(0, 0, 0, 0.1)',
          color: currentFailState ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)',
        }}
      >
        {currentFailState ? (
          <img src="icons/Fail.png" alt="Fail" />
        ) : (
          <img src="icons/NotFail.png" alt="Not Fail" />
        )}
        <Typography style={{ paddingLeft: 10, fontFamily: 'Ubuntu' }}>
          Fail
        </Typography>
      </Button>
    </div>
  );
};

export default ToggleComponent;
