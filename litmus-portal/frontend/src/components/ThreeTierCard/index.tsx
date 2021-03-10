import { Paper, Typography } from '@material-ui/core';
import { ButtonFilled } from 'litmus-ui';
import React from 'react';
import useStyles from './styles';

interface ThreeTierCardProps {
  isDisabled?: boolean;
  mainHeading: Array<string>;
  subHeading?: string;
  description?: string;
  buttonText?: string;
  handleClick?: () => void;
}

const ThreeTierCard: React.FC<ThreeTierCardProps> = ({
  isDisabled = false,
  mainHeading,
  subHeading,
  description,
  buttonText,
  handleClick,
}) => {
  const classes = useStyles();
  return (
    <Paper elevation={0} className={classes.root}>
      <div className={classes.textSection}>
        <div>
          <Typography className={classes.mainHeading}>
            <strong>
              {mainHeading[0]}
              {'\xa0'}
              <span className={classes.activeGreen}>{mainHeading[1]}</span>
              {'\xa0'}
              {mainHeading[2]}
            </strong>
          </Typography>
          <Typography className={classes.subHeading}>
            <strong>{subHeading}</strong>
          </Typography>

          <Typography className={classes.description}>{description}</Typography>
          <div className={classes.predefinedBtn}>
            <ButtonFilled
              disabled={isDisabled}
              variant="success"
              onClick={handleClick}
            >
              <Typography variant="subtitle1">{buttonText}</Typography>
            </ButtonFilled>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export { ThreeTierCard };
