import { Divider, Typography } from '@material-ui/core';
import React from 'react';
import formatCount from '../../utils/formatCount';
import { CardProps } from './model';
import useStyles from './styles';

const CardContent: React.FC<CardProps> = ({
  title,
  urlToIcon,
  experimentCount,
  provider,
  description,
  totalRuns,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.cardContent}>
      <div className={classes.cardAnalytics}>
        <span className={classes.totalRuns}>{formatCount(totalRuns)}</span>
        <span className={classes.expCount}>{experimentCount} Experiments</span>
      </div>
      <div className={classes.cardBody}>
        {urlToIcon ? (
          <div className={classes.cardMedia}>
            <img src={urlToIcon} alt="chart provider logo" />
          </div>
        ) : (
          <div className={classes.noImage}>Image</div>
        )}
        <div className={classes.cardInfo}>
          <div className={classes.title}>{title}</div>
          <div className={classes.provider}>Contributed by {provider}</div>
        </div>
        {description ? (
          <div className={classes.description}>{description}</div>
        ) : (
          <span />
        )}
        <Divider />
        <div className={classes.seeDetails}>
          <Typography>See details</Typography>
        </div>
      </div>
    </div>
  );
};

export default CardContent;
