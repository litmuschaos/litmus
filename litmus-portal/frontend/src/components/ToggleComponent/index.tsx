import React from 'react';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import useStyles from './styles';

const ToggleComponent = () => {
  const classes = useStyles();

  // Default Props are false
  const [currentState, setCurrentState] = React.useState<boolean>(true);

  // Toggle Handlers
  const passToggler = () => {
    if (currentState === false) {
      setCurrentState(true);
    }
  };

  const failToggler = () => {
    if (currentState === true) {
      setCurrentState(false);
    }
  };

  return (
    <div className={classes.root}>
      {/* Pass Button */}
      <Button
        onClick={passToggler}
        aria-label="left aligned"
        className={classes.toggleBtn}
        style={{
          backgroundColor: currentState ? '#109B67' : 'rgba(0, 0, 0, 0.1)',
          color: currentState ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)',
        }}
      >
        {currentState ? (
          <img src="icons/Pass.png" alt="Pass" />
        ) : (
          <img src="icons/NotPass.png" alt="Not Pass" />
        )}
        <Typography className={classes.typography}>Pass</Typography>
      </Button>

      {/* Failed Button */}
      <Button
        onClick={failToggler}
        aria-label="left aligned"
        className={classes.toggleBtn}
        style={{
          backgroundColor:
            currentState !== true ? '#CA2C2C' : 'rgba(0, 0, 0, 0.1)',
          color: currentState !== true ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)',
        }}
      >
        {currentState !== true ? (
          <img src="icons/Fail.png" alt="Fail" />
        ) : (
          <img src="icons/NotFail.png" alt="Not Fail" />
        )}
        <Typography className={classes.typography}>Fail</Typography>
      </Button>
    </div>
  );
};

export default ToggleComponent;
