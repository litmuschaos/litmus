import React from 'react';
import { Typography } from '@material-ui/core';
import useStyles from './styles';

interface RecommendationProps {
  recommendation?: string;
}

const Recommendation: React.FC<RecommendationProps> = ({ recommendation }) => {
  const classes = useStyles();

  return (
    <div className={classes.flexRow}>
      <div className={classes.body}>
        <Typography className={classes.headerText}>
          <strong>Recommendation</strong>
        </Typography>

        <div className={classes.bodytext}>
          <Typography align="left" className={classes.bodytext}>
            {recommendation}
          </Typography>
        </div>
      </div>
      <img src="/icons/like.svg" alt="Like" className={classes.bgIcon} />
    </div>
  );
};

export default Recommendation;
