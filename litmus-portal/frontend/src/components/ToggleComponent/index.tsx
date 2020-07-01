import { Typography } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import React from 'react';

const ToggleComponent = () => {
  const [alignment, setAlignment] = React.useState<string | null>('pass');

  const handleAlignment = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    setAlignment(newAlignment);
  };
  return (
    <ToggleButtonGroup
      value={alignment}
      exclusive
      onChange={handleAlignment}
      aria-label="text alignment"
    >
      <ToggleButton
        value="pass"
        aria-label="left aligned"
        style={{
          width: 93,
          height: 38,
          borderRadius: 3,
          border: 'rgba(0, 0, 0, 0.0)',
          backgroundColor: alignment === 'pass' ? '#109B67' : 'rgba(0, 0, 0, 0.1)',
          color: alignment === 'pass' ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)',
        }}
      >
        {alignment === 'pass' ? (
          <img src="icons/Pass.png" alt="Pass" />
        ) : (
          <img src="icons/NotPass.png" alt="NotPass" />
        )}
        <Typography style={{ paddingLeft: 10, fontFamily: 'Ubuntu' }}>Pass</Typography>
      </ToggleButton>
      <ToggleButton
        value="fail"
        aria-label="centered"
        style={{
          width: 93,
          height: 38,
          borderRadius: 3,
          border: 'rgba(0, 0, 0, 0.0)',
          backgroundColor: alignment === 'fail' ? '#CA2C2C' : 'rgba(0, 0, 0, 0.1)',
          color: alignment === 'fail' ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)',
        }}
      >
        {alignment === 'fail' ? (
          <img src="icons/Fail.png" alt="Fail" />
        ) : (
          <img src="icons/NotFail.png" alt="NotFail" />
        )}
        <Typography style={{ paddingLeft: 10, fontFamily: 'Ubuntu' }}>Fail</Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ToggleComponent;
