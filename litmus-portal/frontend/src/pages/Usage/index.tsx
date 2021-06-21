import { Typography } from '@material-ui/core';
import React from 'react';
import Scaffold from '../../containers/layouts/Scaffold';
import UsageStats from '../../views/Usage/UsageStats';

const Usage = () => {
  return (
    <Scaffold>
      <Typography variant="h3">Usage</Typography>
      <Typography
        style={{
          fontWeight: 400,
          fontSize: '18px',
          marginTop: 20,
          color: 'rgba(105, 111, 140, 1)',
        }}
      >
        Global and project level usage details. Available only to the admin
        user.
      </Typography>
      <UsageStats />
    </Scaffold>
  );
};

export default Usage;
