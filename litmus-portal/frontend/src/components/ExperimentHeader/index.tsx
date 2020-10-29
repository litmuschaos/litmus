import React from 'react';
import { IconButton, Typography } from '@material-ui/core';
import useStyles from './styles';

interface ExpInfoProps {
  title: string | undefined;
  description?: string | undefined;
  urlToIcon: string;
}

const ExperimentHeader: React.FC<ExpInfoProps> = ({
  title,
  description,
  urlToIcon,
}) => {
  const classes = useStyles();
  const desc = description?.split('.').slice(0, 1);
  return (
    <div className={classes.root}>
      <IconButton
        data-cy="backButton"
        onClick={() => window.history.back()}
        className={classes.backButton}
      >
        <img
          src="/icons/BackArrow.svg"
          alt="back"
          className={classes.backBtnImg}
        />
      </IconButton>
      <img src={urlToIcon} alt="exp icon" className={classes.expImg} />
      <div className={classes.titleDiv}>
        <Typography className={classes.expHeader}>{title}</Typography>
        <Typography>{desc}.</Typography>
      </div>
    </div>
  );
};
export default ExperimentHeader;
