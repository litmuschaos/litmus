import { Typography } from '@material-ui/core';
import React from 'react';
import capitalize from '../../../utils/capitalize';
import useStyles from './styles';

interface HeadProps {
  image?: string;
  title?: string;
  details?: string;
}

const Head: React.FC<HeadProps> = ({ image, title, details }) => {
  const classes = useStyles();
  return (
    <div className={classes.flexRow}>
      <img src={image} alt="workflowIcon" className={classes.bgIcon} />
      <div className={classes.body}>
        <Typography data-cy="expName" className={classes.headerText}>
          {/* Converting 'some-experiment' to 'Some Experiment' using capitalize utility */}
          {title?.split('-').map((text) => `${capitalize(text)} `)}
        </Typography>
        <Typography className={classes.bodytext}>{details}</Typography>
      </div>
    </div>
  );
};

export default Head;
