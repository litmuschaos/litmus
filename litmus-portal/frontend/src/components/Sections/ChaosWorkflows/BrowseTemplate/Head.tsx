import React from 'react';
import { Typography } from '@material-ui/core';
import useStyles from './styles';
import capitalize from '../../../../utils/capitalize';

interface HeadProps {
  image?: string;
  title?: string;
}

const Head: React.FC<HeadProps> = ({ image, title }) => {
  const classes = useStyles();
  return (
    <div className={classes.flexRow}>
      <img src={image} alt="workflowIcon" className={classes.bgIcon} />
      <div className={classes.body}>
        <Typography className={classes.headerText}>
          {/* Converting 'some-experiment' to 'Some Experiment' using capitalize utility */}
          {title?.split('-').map((text) => `${capitalize(text)} `)}
        </Typography>
        <Typography className={classes.bodytext}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
          bibendum quis nisi nec interdum. Vestibulum fringilla bibendum mollis.
          Sed eget metus enim. Etiam vitae purus in est finibus facilisis.
          Curabitur bibendum quis nisi nec interdum.
        </Typography>
      </div>
    </div>
  );
};

export default Head;
