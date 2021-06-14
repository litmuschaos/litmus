import { Paper, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface OverviewContainerProps {
  count: number;
  countUnit: string;
  description: string;
  maxWidth: string;
  button: React.ReactNode;
}

const OverviewContainer: React.FC<OverviewContainerProps> = ({
  count,
  countUnit,
  description,
  maxWidth,
  button,
}) => {
  const classes = useStyles();

  return (
    <div>
      {/* Agent info container */}
      <Paper className={classes.agentInfoContainer}>
        <div className={classes.agentInfoBlock}>
          <div
            style={{ maxWidth: `${maxWidth}` }}
            className={classes.agentInfoData}
          >
            <div>
              <Typography className={classes.count}>{count}</Typography>
              {count === 1 ? (
                <Typography>{countUnit}</Typography>
              ) : (
                <Typography>{countUnit}s</Typography>
              )}
            </div>
            <div>
              <Typography className={classes.desicription}>
                {description}
              </Typography>
            </div>
          </div>
        </div>
        {button}
      </Paper>
    </div>
  );
};

export { OverviewContainer };
