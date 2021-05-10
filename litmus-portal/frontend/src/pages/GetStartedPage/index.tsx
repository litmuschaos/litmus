import React from 'react';
import Center from '../../containers/layouts/Center';
import PasswordSet from '../../views/GetStarted/PasswordSet';
import useStyles from './styles';

const GetStarted: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.rootContainer}>
      <Center>
        <PasswordSet />
      </Center>
    </div>
  );
};

export default GetStarted;
