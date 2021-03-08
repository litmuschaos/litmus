import { Paper, Typography } from '@material-ui/core';
import React from 'react';
import { ReactComponent as ConfigureIcon } from '../../svg/configureIcon.svg';
import useStyles from './styles';

interface ConfigurationBannerProps {
  isDisabled?: boolean;
  heading?: string;
  description?: string;
}

const ConfigurationBanner: React.FC<ConfigurationBannerProps> = ({
  isDisabled,
  heading,
  description,
}) => {
  const classes = useStyles({ isDisabled });

  return (
    <Paper elevation={0} className={classes.root}>
      <div className={classes.textSection}>
        <div>
          <Typography className={classes.heading}>
            <strong>{heading}</strong>
          </Typography>
          <Typography className={classes.description}>{description}</Typography>
        </div>
      </div>

      <ConfigureIcon className={classes.configurationIcon} />
    </Paper>
  );
};

export { ConfigurationBanner };
