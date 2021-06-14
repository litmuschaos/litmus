/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Typography } from '@material-ui/core';
import React from 'react';
import { DashboardData } from '../../../../../../models/dashboardsData';
import useStyles from './styles';

const CardContent: React.FC<DashboardData> = ({
  typeName,
  urlToIcon,
  handleClick,
  information,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.card}>
      <div className={classes.cardContent} onClick={handleClick ?? (() => {})}>
        {urlToIcon ? (
          <div className={classes.cardMedia}>
            <img src={urlToIcon} alt="dashboard logo" />
          </div>
        ) : (
          <div className={classes.noImage}>Image</div>
        )}
        <div className={classes.meta}>
          <Typography data-cy="dashboardName" className={classes.title}>
            {typeName}
          </Typography>
          {information ? (
            <Typography className={classes.description}>
              {information}
            </Typography>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
};
export default CardContent;
