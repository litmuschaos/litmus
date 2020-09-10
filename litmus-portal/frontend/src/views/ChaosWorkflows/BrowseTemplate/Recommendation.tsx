import React from 'react';
import { Typography } from '@material-ui/core';
import useStyles from './styles';

const Recommendation: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.flexRow}>
      <div className={classes.body}>
        <Typography className={classes.headerText}>
          <strong>Recommendation</strong>
        </Typography>

        <div className={classes.bodytext}>
          <Typography align="left" className={classes.bodytext}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
            bibendum quis nisi nec interdum. Vestibulum fringilla bibendum
            mollis. Sed eget metus enim. Etiam vitae purus in est finibus
            facilisis. Curabitur bibendum quis nisi nec interdum.
          </Typography>
        </div>
      </div>
      <img src="/icons/like.svg" alt="Like" className={classes.bgIcon} />
    </div>
  );
};

export default Recommendation;
